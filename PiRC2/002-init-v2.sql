-- Migration 002 — PiRC2 indexer DB v1 -> v2
--
-- What's new in v2:
--   * contract_state / indexer_cursor  — track deployed contract + resume point
--   * contract_events                  — full event log (srv_reg, sub, approve,
--                                         cancel, renew, extend, charge, trl_end,
--                                         low_alw, low_bal, chg_fail, upgrade)
--   * process_batches                  — one row per process(offset, limit) call
--   * generated timestamptz columns    — created_at_tsz etc. for fast range queries
--   * CHECK constraints                — mirror on-chain validation (InvalidPrice,
--                                         InvalidPeriod, InvalidServiceName)
--   * uq_active_sub_service            — dedup guard matching SubServicePair
--   * no-drift trigger on next_charge_ts
--   * views: active_subscriptions, due_subscriptions, service_mrr,
--            merchant_billing_health
--
-- Safe to run against a database created by 001_init_v1.sql. Additive only —
-- does not drop or rewrite existing services/subscriptions rows.

BEGIN;

SET search_path TO pirc2, public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- enums -------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE pirc2.event_type AS ENUM (
        'srv_reg', 'sub', 'approve', 'cancel', 'renew', 'extend',
        'charge', 'trl_end', 'low_alw', 'low_bal', 'chg_fail', 'upgrade'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pirc2.error_code AS ENUM (
        'InvalidPrice', 'InvalidPeriod', 'AlreadySubscribed',
        'SubscriptionNotFound', 'ServiceNotFound', 'Unauthorized',
        'AlreadyCancelled', 'TimestampOverflow', 'NotServiceOwner',
        'InvalidServiceName', 'SubscriptionExpired'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- services: add validation + generated columns -----------------------
ALTER TABLE pirc2.services
    ADD COLUMN IF NOT EXISTS created_at_tsz TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(created_at)) STORED,
    ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS row_created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE pirc2.services
    ADD CONSTRAINT chk_services_price_positive CHECK (price > 0) NOT VALID,
    ADD CONSTRAINT chk_services_period_positive CHECK (period_secs > 0) NOT VALID,
    ADD CONSTRAINT chk_services_approve_periods_positive CHECK (approve_periods > 0) NOT VALID,
    ADD CONSTRAINT chk_services_name_nonempty CHECK (btrim(name) <> '') NOT VALID;

ALTER TABLE pirc2.services VALIDATE CONSTRAINT chk_services_price_positive;
ALTER TABLE pirc2.services VALIDATE CONSTRAINT chk_services_period_positive;
ALTER TABLE pirc2.services VALIDATE CONSTRAINT chk_services_approve_periods_positive;
ALTER TABLE pirc2.services VALIDATE CONSTRAINT chk_services_name_nonempty;

CREATE INDEX IF NOT EXISTS idx_services_merchant   ON pirc2.services (merchant);
CREATE INDEX IF NOT EXISTS idx_services_active     ON pirc2.services (is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_services_created_at ON pirc2.services (created_at_tsz);

-- ---- subscriptions: add validation, generated columns, dedup guard ------
ALTER TABLE pirc2.subscriptions
    ADD COLUMN IF NOT EXISTS created_at_tsz      TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(created_at)) STORED,
    ADD COLUMN IF NOT EXISTS service_end_at_tsz    TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(service_end_ts)) STORED,
    ADD COLUMN IF NOT EXISTS next_charge_at_tsz     TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(next_charge_ts)) STORED,
    ADD COLUMN IF NOT EXISTS used_trial              BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS row_created_at            TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE pirc2.subscriptions
    ADD CONSTRAINT chk_subs_price_positive CHECK (price > 0) NOT VALID,
    ADD CONSTRAINT chk_subs_period_positive CHECK (period_secs > 0) NOT VALID;

ALTER TABLE pirc2.subscriptions VALIDATE CONSTRAINT chk_subs_price_positive;
ALTER TABLE pirc2.subscriptions VALIDATE CONSTRAINT chk_subs_period_positive;

-- Dedup guard (mirrors SubServicePair / AlreadySubscribed):
-- one row per (subscriber, service_id) in this table. If your v1 data
-- already has duplicates from a prior cancel/resubscribe flow, resolve
-- them before this migration or relax to a partial unique index instead.
ALTER TABLE pirc2.subscriptions
    ADD CONSTRAINT uq_active_sub_service UNIQUE (subscriber, service_id);

CREATE INDEX IF NOT EXISTS idx_subs_subscriber  ON pirc2.subscriptions (subscriber);
CREATE INDEX IF NOT EXISTS idx_subs_service_id   ON pirc2.subscriptions (service_id);
CREATE INDEX IF NOT EXISTS idx_subs_due           ON pirc2.subscriptions (service_id, next_charge_ts) WHERE pay_upfront;
CREATE INDEX IF NOT EXISTS idx_subs_active_window  ON pirc2.subscriptions (service_end_ts);

-- ---- new tables ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pirc2.contract_state (
    id                  SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    contract_address    TEXT NOT NULL,
    admin_address       TEXT NOT NULL,
    token_address       TEXT NOT NULL,
    contract_version    INTEGER NOT NULL DEFAULT 3,
    network              TEXT NOT NULL DEFAULT 'testnet' CHECK (network IN ('mainnet', 'testnet', 'futurenet')),
    deployed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_upgraded_at    TIMESTAMPTZ,
    last_indexed_ledger BIGINT NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pirc2.contract_events (
    event_id           BIGSERIAL PRIMARY KEY,
    event_type          pirc2.event_type NOT NULL,
    ledger_seq            BIGINT NOT NULL,
    tx_hash                TEXT NOT NULL,
    event_index             INTEGER NOT NULL DEFAULT 0,
    service_id                BIGINT REFERENCES pirc2.services (service_id) ON DELETE SET NULL,
    sub_id                      BIGINT REFERENCES pirc2.subscriptions (sub_id) ON DELETE SET NULL,
    actor                         TEXT,
    amount                          NUMERIC(38, 0),
    error_code                       pirc2.error_code,
    payload                            JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at                         BIGINT NOT NULL,
    occurred_at_tsz                      TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(occurred_at)) STORED,
    indexed_at                             TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_event_position UNIQUE (tx_hash, event_index)
);

CREATE INDEX IF NOT EXISTS idx_events_type        ON pirc2.contract_events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_service     ON pirc2.contract_events (service_id);
CREATE INDEX IF NOT EXISTS idx_events_sub         ON pirc2.contract_events (sub_id);
CREATE INDEX IF NOT EXISTS idx_events_ledger      ON pirc2.contract_events (ledger_seq);
CREATE INDEX IF NOT EXISTS idx_events_occurred    ON pirc2.contract_events (occurred_at_tsz);
CREATE INDEX IF NOT EXISTS idx_events_payload_gin ON pirc2.contract_events USING GIN (payload);

CREATE TABLE IF NOT EXISTS pirc2.process_batches (
    batch_id            BIGSERIAL PRIMARY KEY,
    service_id            BIGINT NOT NULL REFERENCES pirc2.services (service_id),
    merchant                TEXT NOT NULL,
    tx_hash                   TEXT NOT NULL,
    offset_arg                  BIGINT NOT NULL DEFAULT 0,
    limit_arg                     BIGINT NOT NULL,
    charged                         INTEGER NOT NULL DEFAULT 0,
    failed                            INTEGER NOT NULL DEFAULT 0,
    skipped                            INTEGER NOT NULL DEFAULT 0,
    total                                INTEGER GENERATED ALWAYS AS (charged + failed + skipped) STORED,
    ledger_seq                            BIGINT NOT NULL,
    occurred_at                             BIGINT NOT NULL,
    occurred_at_tsz                          TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(occurred_at)) STORED,
    indexed_at                                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batches_service  ON pirc2.process_batches (service_id);
CREATE INDEX IF NOT EXISTS idx_batches_merchant ON pirc2.process_batches (merchant);
CREATE INDEX IF NOT EXISTS idx_batches_occurred ON pirc2.process_batches (occurred_at_tsz);

CREATE TABLE IF NOT EXISTS pirc2.indexer_cursor (
    id                SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_ledger_seq     BIGINT NOT NULL DEFAULT 0,
    last_paging_token     TEXT,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- triggers --------------------------------------------------------------
CREATE OR REPLACE FUNCTION pirc2.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_services_touch ON pirc2.services;
CREATE TRIGGER trg_services_touch
    BEFORE UPDATE ON pirc2.services
    FOR EACH ROW EXECUTE FUNCTION pirc2.touch_updated_at();

DROP TRIGGER IF EXISTS trg_subs_touch ON pirc2.subscriptions;
CREATE TRIGGER trg_subs_touch
    BEFORE UPDATE ON pirc2.subscriptions
    FOR EACH ROW EXECUTE FUNCTION pirc2.touch_updated_at();

CREATE OR REPLACE FUNCTION pirc2.guard_no_drift()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.next_charge_ts < OLD.next_charge_ts THEN
        RAISE EXCEPTION
            'next_charge_ts may not move backward (sub_id=%, old=%, new=%)',
            OLD.sub_id, OLD.next_charge_ts, NEW.next_charge_ts;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subs_no_drift ON pirc2.subscriptions;
CREATE TRIGGER trg_subs_no_drift
    BEFORE UPDATE OF next_charge_ts ON pirc2.subscriptions
    FOR EACH ROW EXECUTE FUNCTION pirc2.guard_no_drift();

-- ---- views -------------------------------------------------------------
CREATE OR REPLACE VIEW pirc2.active_subscriptions AS
SELECT s.* FROM pirc2.subscriptions s WHERE s.service_end_at_tsz > now();

CREATE OR REPLACE VIEW pirc2.due_subscriptions AS
SELECT s.* FROM pirc2.subscriptions s
WHERE s.pay_upfront = TRUE AND s.next_charge_at_tsz <= now();

CREATE OR REPLACE VIEW pirc2.service_mrr AS
SELECT
    sv.service_id, sv.merchant, sv.name, sv.price, sv.period_secs,
    COUNT(sub.sub_id) FILTER (WHERE sub.pay_upfront) AS recurring_subscribers,
    (sv.price * COUNT(sub.sub_id) FILTER (WHERE sub.pay_upfront)
        * (2592000.0 / sv.period_secs))::NUMERIC(38, 4) AS est_mrr_30d
FROM pirc2.services sv
LEFT JOIN pirc2.subscriptions sub ON sub.service_id = sv.service_id
GROUP BY sv.service_id, sv.merchant, sv.name, sv.price, sv.period_secs;

CREATE OR REPLACE VIEW pirc2.merchant_billing_health AS
SELECT
    sv.merchant, sv.service_id, sv.name,
    SUM(pb.charged) AS total_charged,
    SUM(pb.failed)  AS total_failed,
    SUM(pb.skipped) AS total_skipped,
    ROUND(100.0 * NULLIF(SUM(pb.charged), 0)
        / NULLIF(SUM(pb.charged) + SUM(pb.failed), 0), 2) AS success_rate_pct
FROM pirc2.services sv
LEFT JOIN pirc2.process_batches pb ON pb.service_id = sv.service_id
GROUP BY sv.merchant, sv.service_id, sv.name;

COMMIT;
