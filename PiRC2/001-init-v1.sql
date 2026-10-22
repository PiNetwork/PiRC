-- Migration 001 — PiRC2 indexer DB v1 (baseline)
-- Minimal mirror of on-chain Service / Subscription structs only.
-- Superseded by 002_v2_events_and_analytics.sql.

BEGIN;

CREATE SCHEMA IF NOT EXISTS pirc2;
SET search_path TO pirc2, public;

CREATE TABLE IF NOT EXISTS pirc2.services (
    service_id       BIGINT PRIMARY KEY,
    merchant          TEXT NOT NULL,
    name              TEXT NOT NULL,
    price             NUMERIC(38, 0) NOT NULL,
    period_secs       BIGINT NOT NULL,
    trial_period_secs BIGINT NOT NULL DEFAULT 0,
    approve_periods   BIGINT NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS pirc2.subscriptions (
    sub_id            BIGINT PRIMARY KEY,
    subscriber        TEXT NOT NULL,
    service_id        BIGINT NOT NULL REFERENCES pirc2.services (service_id),
    price             NUMERIC(38, 0) NOT NULL,
    period_secs       BIGINT NOT NULL,
    trial_period_secs BIGINT NOT NULL DEFAULT 0,
    trial_end_ts      BIGINT NOT NULL DEFAULT 0,
    pay_upfront       BOOLEAN NOT NULL DEFAULT FALSE,
    service_end_ts    BIGINT NOT NULL,
    next_charge_ts    BIGINT NOT NULL,
    created_at        BIGINT NOT NULL
);

COMMIT;
