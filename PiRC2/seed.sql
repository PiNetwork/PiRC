-- =====================================================================
-- PiRC2 Indexer Database — Seed data (v2)
-- Realistic demo dataset: 1 deployed contract, 5 services across 3
-- merchants, 12 subscriptions in various lifecycle states, matching
-- event log entries, and 2 batch process() runs.
-- All timestamps are unix seconds. "now" is anchored near migration
-- time so the demo data reads sensibly regardless of when it's loaded.
-- =====================================================================

BEGIN;
SET search_path TO pirc2, public;

-- Anchor "now" for readable relative timestamps.
-- 1758,067,200 = 2025-09-17 00:00:00 UTC (adjust if you want a live demo)
-- Using extract(epoch from now()) keeps due/overdue rows meaningful
-- whenever this file is actually run.
DO $$
DECLARE
    t_now   BIGINT := floor(extract(epoch FROM now()))::BIGINT;
    day     CONSTANT BIGINT := 86400;
    month   CONSTANT BIGINT := 2592000;  -- 30 days, matches period_secs convention below
BEGIN

-- ---- contract_state ------------------------------------------------------
INSERT INTO pirc2.contract_state
    (id, contract_address, admin_address, token_address, contract_version,
     network, deployed_at, last_indexed_ledger)
VALUES
    (1,
     'CDPIRC2SUBSCRIPTIONCONTRACTXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
     'GADMIN2TSUKIXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
     'GATOKENPIUSDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
     3, 'testnet', to_timestamp(t_now - 120 * day), 4821390)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pirc2.indexer_cursor (id, last_ledger_seq, last_paging_token)
VALUES (1, 4821390, '4821390-0')
ON CONFLICT (id) DO NOTHING;

-- ---- services --------------------------------------------------------------
-- service_id | merchant     | name                    | price(PiUSD, 7dp) | period    | trial   | approve_periods
INSERT INTO pirc2.services
    (service_id, merchant, name, price, period_secs, trial_period_secs, approve_periods, is_active, created_at)
VALUES
    (1, 'GMERCH1AIWRITERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'AI Writer Pro Monthly',   90000000,  month, 7 * day, 12, TRUE,  t_now - 100 * day),
    (2, 'GMERCH1AIWRITERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'AI Writer Pro Annual',    900000000, 12 * month, 0, 1,  TRUE,  t_now - 100 * day),
    (3, 'GMERCH2STREAMBOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'StreamBox Standard',      50000000,  month, 3 * day, 6,  TRUE,  t_now - 80 * day),
    (4, 'GMERCH2STREAMBOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'StreamBox Premium 4K',    120000000, month, 3 * day, 6,  TRUE,  t_now - 80 * day),
    (5, 'GMERCH3GYMPASSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'GymPass Local Commerce',  200000000, month, 0,       3,  FALSE, t_now - 60 * day)
ON CONFLICT (service_id) DO NOTHING;

-- Keep service_id sequence in sync if this table uses a sequence elsewhere;
-- schema.sql defines service_id as a plain BIGINT PK populated by the
-- indexer from on-chain events, so no sequence to reset here.

-- ---- subscriptions -----------------------------------------------------------
-- A spread of lifecycle states: active+recurring, trial-in-progress,
-- cancelled-but-still-active, one-time (expiring), and auto-cancelled
-- after a failed charge.
INSERT INTO pirc2.subscriptions
    (sub_id, subscriber, service_id, price, period_secs, trial_period_secs,
     trial_end_ts, pay_upfront, service_end_ts, next_charge_ts, created_at, used_trial)
VALUES
    -- 1: past trial, recurring, next charge due soon
    (1,  'GSUB0001XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 1, 90000000,  month, 7*day, t_now - 60*day, TRUE,  t_now + 2*day,  t_now + 2*day,  t_now - 67*day, TRUE),
    -- 2: currently inside free trial, auto_renew set, no payment yet
    (2,  'GSUB0002XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 1, 90000000,  month, 7*day, t_now + 3*day,  TRUE,  t_now + 3*day,  t_now + 3*day,  t_now - 4*day,  TRUE),
    -- 3: annual plan, recurring, mid-cycle
    (3,  'GSUB0003XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 2, 900000000, 12*month, 0, 0, TRUE, t_now + 200*day, t_now + 200*day, t_now - 165*day, FALSE),
    -- 4: cancelled recurring (pay_upfront=false) but still inside paid period
    (4,  'GSUB0004XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 3, 50000000,  month, 3*day, t_now - 40*day, FALSE, t_now + 5*day,  t_now - 20*day, t_now - 50*day, TRUE),
    -- 5: active, recurring, healthy
    (5,  'GSUB0005XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 3, 50000000,  month, 3*day, t_now - 55*day, TRUE,  t_now + 10*day, t_now + 10*day, t_now - 58*day, TRUE),
    -- 6: one-time (pay_upfront=false from the start), about to expire
    (6,  'GSUB0006XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 4, 120000000, month, 3*day, 0, FALSE, t_now + 1*day,  t_now - 29*day, t_now - 32*day, FALSE),
    -- 7: premium, recurring, healthy, several cycles in
    (7,  'GSUB0007XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 4, 120000000, month, 3*day, t_now - 70*day, TRUE,  t_now + 8*day,  t_now + 8*day,  t_now - 73*day, TRUE),
    -- 8: auto-cancelled after a failed charge (pay_upfront flipped to false by process())
    (8,  'GSUB0008XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 3, 50000000,  month, 3*day, t_now - 90*day, FALSE, t_now - 5*day,  t_now - 5*day,  t_now - 93*day, TRUE),
    -- 9: brand-new, first charge already taken, recurring
    (9,  'GSUB0009XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 1, 90000000,  month, 7*day, 0, TRUE, t_now + 27*day, t_now + 27*day, t_now - 3*day, FALSE),
    -- 10: annual plan subscriber near renewal
    (10, 'GSUB0010XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 2, 900000000, 12*month, 0, 0, TRUE, t_now + 4*day,  t_now + 4*day,  t_now - 356*day, FALSE),
    -- 11: standard plan, recurring, overdue for process() (indexer/demo of "due" view)
    (11, 'GSUB0011XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 3, 50000000,  month, 3*day, t_now - 95*day, TRUE,  t_now - 1*day,  t_now - 1*day,  t_now - 98*day, TRUE),
    -- 12: premium plan, extended after low allowance warning
    (12, 'GSUB0012XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 4, 120000000, month, 3*day, t_now - 45*day, TRUE,  t_now + 15*day, t_now + 15*day, t_now - 48*day, TRUE)
ON CONFLICT (sub_id) DO NOTHING;

-- ---- contract_events --------------------------------------------------------
INSERT INTO pirc2.contract_events
    (event_type, ledger_seq, tx_hash, event_index, service_id, sub_id, actor, amount, error_code, payload, occurred_at)
VALUES
    ('srv_reg', 4700100, '11111111111111111111111111111111111111111111111111111111111111', 0, 1, NULL, 'GMERCH1AIWRITERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', NULL, NULL, '{"name":"AI Writer Pro Monthly"}', t_now - 100*day),
    ('srv_reg', 4700101, '22222222222222222222222222222222222222222222222222222222222222', 0, 3, NULL, 'GMERCH2STREAMBOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', NULL, NULL, '{"name":"StreamBox Standard"}', t_now - 80*day),
    ('sub',     4750210, '33333333333333333333333333333333333333333333333333333333333333', 0, 1, 1, 'GSUB0001XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', NULL, NULL, '{"trial": true, "pay_upfront": true}', t_now - 67*day),
    ('approve', 4750210, '33333333333333333333333333333333333333333333333333333333333333', 1, 1, 1, 'GSUB0001XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 1080000000, NULL, '{"approve_periods":12}', t_now - 67*day),
    ('trl_end', 4761040, '44444444444444444444444444444444444444444444444444444444444444', 0, 1, 1, 'GSUB0001XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 90000000, NULL, '{}', t_now - 60*day),
    ('charge',  4761040, '44444444444444444444444444444444444444444444444444444444444444', 1, 1, 1, 'GSUB0001XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 90000000, NULL, '{}', t_now - 60*day),
    ('cancel',  4790500, '55555555555555555555555555555555555555555555555555555555555555', 0, 3, 4, 'GSUB0004XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', NULL, NULL, '{"remaining_active_secs": 4320000}', t_now - 40*day),
    ('chg_fail', 4795100, '66666666666666666666666666666666666666666666666666666666666666', 0, 3, 8, 'GSUB0008XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 50000000, NULL, '{"reason": "insufficient_balance"}', t_now - 5*day)
ON CONFLICT DO NOTHING;

-- ---- process_batches ------------------------------------------------------
INSERT INTO pirc2.process_batches
    (service_id, merchant, tx_hash, offset_arg, limit_arg, charged, failed, skipped, ledger_seq, occurred_at)
VALUES
    (1, 'GMERCH1AIWRITERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '77777777777777777777777777777777777777777777777777777777777777', 0, 50, 3, 0, 1, 4761040, t_now - 60*day),
    (3, 'GMERCH2STREAMBOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '88888888888888888888888888888888888888888888888888888888888888', 0, 50, 2, 1, 2, 4795100, t_now - 5*day)
ON CONFLICT DO NOTHING;

END $$;

COMMIT;
