-- =====================================================================
-- PiRC2 Indexer Database — Schema v2
-- Off-chain relational mirror of the PiRC2 Soroban subscription
-- contract (Pi Network). Tracks Services, Subscriptions, contract
-- events, and batch `process()` runs for querying/analytics without
-- hitting the ledger directly.
--
-- Contract reference: Tsukimarf/PiRC -> PiRC2 (subscription API)
-- Contract version tracked: 3 (see contract_state.contract_version)
-- Target: PostgreSQL 14+
-- =====================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS pirc2;
SET search_path TO pirc2, public;

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE pirc2.event_type AS ENUM (
        'srv_reg',   -- service registered
        'sub',       -- subscription created
        'approve',   -- token allowance approved/refreshed
        'cancel',    -- subscriber cancelled recurring billing
        'renew',     -- toggle_pay_upfront -> true
        'extend',    -- extend_subscription
        'charge',    -- successful periodic charge
        'trl_end',   -- first charge after trial ended
        'low_alw',   -- remaining allowance < price
        'low_bal',   -- subscriber balance < price
        'chg_fail',  -- charge attempt failed, auto-cancelled
        'upgrade'    -- contract WASM upgraded
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pirc2.error_code AS ENUM (
        'InvalidPrice',
        'InvalidPeriod',
        'AlreadySubscribed',
        'SubscriptionNotFound',
        'ServiceNotFound',
        'Unauthorized',
        'AlreadyCancelled',
        'TimestampOverflow',
        'NotServiceOwner',
        'InvalidServiceName',
        'SubscriptionExpired'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- contract_state — singleton row tracking deployed contract identity
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- services — mirrors Service struct (3.1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pirc2.services (
    service_id          BIGINT PRIMARY KEY,           -- u64 on-chain, auto-increment
    merchant             TEXT NOT NULL,                 -- Address (G...)
    name                 TEXT NOT NULL CHECK (btrim(name) <> ''),
    price                NUMERIC(38, 0) NOT NULL CHECK (price > 0),   -- i128
    period_secs          BIGINT NOT NULL CHECK (period_secs > 0),
    trial_period_secs    BIGINT NOT NULL DEFAULT 0 CHECK (trial_period_secs >= 0),
    approve_periods      BIGINT NOT NULL CHECK (approve_periods > 0),
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           BIGINT NOT NULL,               -- ledger timestamp (unix secs)
    created_at_tsz       TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(created_at)) STORED,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    row_created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_merchant   ON pirc2.services (merchant);
CREATE INDEX IF NOT EXISTS idx_services_active     ON pirc2.services (is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_services_created_at ON pirc2.services (created_at_tsz);

-- ---------------------------------------------------------------------
-- subscriptions — mirrors Subscription struct (3.2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pirc2.subscriptions (
    sub_id               BIGINT PRIMARY KEY,
    subscriber            TEXT NOT NULL,
    service_id            BIGINT NOT NULL REFERENCES pirc2.services (service_id) ON DELETE RESTRICT,
    price                 NUMERIC(38, 0) NOT NULL CHECK (price > 0),      -- locked at subscribe time
    period_secs            BIGINT NOT NULL CHECK (period_secs > 0),
    trial_period_secs      BIGINT NOT NULL DEFAULT 0 CHECK (trial_period_secs >= 0),
    trial_end_ts            BIGINT NOT NULL DEFAULT 0,
    pay_upfront             BOOLEAN NOT NULL DEFAULT FALSE,
    service_end_ts           BIGINT NOT NULL,
    next_charge_ts            BIGINT NOT NULL,
    created_at                BIGINT NOT NULL,
    created_at_tsz             TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(created_at)) STORED,
    service_end_at_tsz          TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(service_end_ts)) STORED,
    next_charge_at_tsz           TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(next_charge_ts)) STORED,
    used_trial                    BOOLEAN NOT NULL DEFAULT FALSE,   -- trial-guard bookkeeping (6.1)
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    row_created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Dedup & trial guard (2. "Dedup & Trial Guard"): one active sub per
    -- (subscriber, service) pair, enforced the same way SubServicePair does.
    CONSTRAINT uq_active_sub_service UNIQUE (subscriber, service_id)
);

CREATE INDEX IF NOT EXISTS idx_subs_subscriber        ON pirc2.subscriptions (subscriber);
CREATE INDEX IF NOT EXISTS idx_subs_service_id         ON pirc2.subscriptions (service_id);
CREATE INDEX IF NOT EXISTS idx_subs_due                ON pirc2.subscriptions (service_id, next_charge_ts) WHERE pay_upfront;
CREATE INDEX IF NOT EXISTS idx_subs_active_window       ON pirc2.subscriptions (service_end_ts);

-- ---------------------------------------------------------------------
-- contract_events — append-only ledger of emitted events (2., 5-8)
-- One row per event topic emitted by the contract; payload keeps the
-- full decoded event body for anything not promoted to a column.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pirc2.contract_events (
    event_id             BIGSERIAL PRIMARY KEY,
    event_type            pirc2.event_type NOT NULL,
    ledger_seq              BIGINT NOT NULL,
    tx_hash                  TEXT NOT NULL,
    event_index               INTEGER NOT NULL DEFAULT 0,   -- position within tx
    service_id                 BIGINT REFERENCES pirc2.services (service_id) ON DELETE SET NULL,
    sub_id                      BIGINT REFERENCES pirc2.subscriptions (sub_id) ON DELETE SET NULL,
    actor                         TEXT,                       -- merchant/subscriber/admin address
    amount                         NUMERIC(38, 0),
    error_code                      pirc2.error_code,
    payload                           JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at                        BIGINT NOT NULL,         -- ledger timestamp
    occurred_at_tsz                     TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(occurred_at)) STORED,
    indexed_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_event_position UNIQUE (tx_hash, event_index)
);

CREATE INDEX IF NOT EXISTS idx_events_type       ON pirc2.contract_events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_service    ON pirc2.contract_events (service_id);
CREATE INDEX IF NOT EXISTS idx_events_sub        ON pirc2.contract_events (sub_id);
CREATE INDEX IF NOT EXISTS idx_events_ledger     ON pirc2.contract_events (ledger_seq);
CREATE INDEX IF NOT EXISTS idx_events_occurred   ON pirc2.contract_events (occurred_at_tsz);
CREATE INDEX IF NOT EXISTS idx_events_payload_gin ON pirc2.contract_events USING GIN (payload);

-- ---------------------------------------------------------------------
-- process_batches — one row per merchant `process(offset, limit)` call,
-- aggregating the ProcessResult { charged, failed, skipped, total } (3.3)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pirc2.process_batches (
    batch_id             BIGSERIAL PRIMARY KEY,
    service_id            BIGINT NOT NULL REFERENCES pirc2.services (service_id) ON DELETE RESTRICT,
    merchant                TEXT NOT NULL,
    tx_hash                  TEXT NOT NULL,
    offset_arg                 BIGINT NOT NULL DEFAULT 0,
    limit_arg                    BIGINT NOT NULL,
    charged                        INTEGER NOT NULL DEFAULT 0,
    failed                           INTEGER NOT NULL DEFAULT 0,
    skipped                           INTEGER NOT NULL DEFAULT 0,
    total                               INTEGER GENERATED ALWAYS AS (charged + failed + skipped) STORED,
    ledger_seq                           BIGINT NOT NULL,
    occurred_at                            BIGINT NOT NULL,
    occurred_at_tsz                         TIMESTAMPTZ GENERATED ALWAYS AS (to_timestamp(occurred_at)) STORED,
    indexed_at                                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batches_service  ON pirc2.process_batches (service_id);
CREATE INDEX IF NOT EXISTS idx_batches_merchant ON pirc2.process_batches (merchant);
CREATE INDEX IF NOT EXISTS idx_batches_occurred ON pirc2.process_batches (occurred_at_tsz);

-- ---------------------------------------------------------------------
-- indexer_cursor — resume point for the off-chain event indexer
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pirc2.indexer_cursor (
    id                   SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_ledger_seq        BIGINT NOT NULL DEFAULT 0,
    last_paging_token        TEXT,
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Trigger: keep updated_at fresh on services / subscriptions
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Trigger: no-drift guard — next_charge_ts may only move forward and
-- only in period_secs-sized steps, matching "No Drift" (2.) and
-- TimestampOverflow (4.) semantics; catches indexer bugs early.
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Views: analytics / convenience
-- ---------------------------------------------------------------------

-- Active subscriptions right now (service_end_ts in the future)
CREATE OR REPLACE VIEW pirc2.active_subscriptions AS
SELECT s.*
FROM pirc2.subscriptions s
WHERE s.service_end_at_tsz > now();

-- Subscriptions due for the next process() call per service
CREATE OR REPLACE VIEW pirc2.due_subscriptions AS
SELECT s.*
FROM pirc2.subscriptions s
WHERE s.pay_upfront = TRUE
  AND s.next_charge_at_tsz <= now();

-- Approximate recurring revenue per service, normalized to a 30-day period
CREATE OR REPLACE VIEW pirc2.service_mrr AS
SELECT
    sv.service_id,
    sv.merchant,
    sv.name,
    sv.price,
    sv.period_secs,
    COUNT(sub.sub_id) FILTER (WHERE sub.pay_upfront) AS recurring_subscribers,
    (sv.price * COUNT(sub.sub_id) FILTER (WHERE sub.pay_upfront)
        * (2592000.0 / sv.period_secs))::NUMERIC(38, 4) AS est_mrr_30d
FROM pirc2.services sv
LEFT JOIN pirc2.subscriptions sub ON sub.service_id = sv.service_id
GROUP BY sv.service_id, sv.merchant, sv.name, sv.price, sv.period_secs;

-- Merchant billing health (successful vs failed charges)
CREATE OR REPLACE VIEW pirc2.merchant_billing_health AS
SELECT
    sv.merchant,
    sv.service_id,
    sv.name,
    SUM(pb.charged) AS total_charged,
    SUM(pb.failed)  AS total_failed,
    SUM(pb.skipped) AS total_skipped,
    ROUND(
        100.0 * NULLIF(SUM(pb.charged), 0)
        / NULLIF(SUM(pb.charged) + SUM(pb.failed), 0), 2
    ) AS success_rate_pct
FROM pirc2.services sv
LEFT JOIN pirc2.process_batches pb ON pb.service_id = sv.service_id
GROUP BY sv.merchant, sv.service_id, sv.name;

COMMIT;
