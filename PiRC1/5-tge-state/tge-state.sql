-- =============================================================================
-- PiRC1 / 5-tge-state — Database Layer (SQL / PostgreSQL twin of tge-state.mql.js)
-- =============================================================================
-- Relational mirror of the MongoDB (MQL) schema so the TGE state model is
-- usable from either a document store or a relational one without drift.
-- Chain-agnostic: designed for Pi Network (Stellar/Soroban) by default,
-- reusable for Solana/Ethereum launches via the `chain` column.
-- =============================================================================

BEGIN;

CREATE TYPE design_variant AS ENUM ('design_1', 'design_2');
CREATE TYPE rollout_step   AS ENUM ('step_2', 'step_3', 'tge');
CREATE TYPE swap_direction AS ENUM ('pi_to_token', 'token_to_pi');

CREATE TABLE launch_config (
    launch_id               TEXT PRIMARY KEY,
    project_name            TEXT NOT NULL,
    design_variant          design_variant NOT NULL,
    chain                   TEXT NOT NULL DEFAULT 'pi-network-soroban',
    committed_pi            NUMERIC(38, 8) NOT NULL,             -- C
    launch_token_allocation NUMERIC(38, 8) NOT NULL,             -- T
    engagement_allocation   NUMERIC(38, 8),                      -- T_engage, design_1 only
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE escrow_wallet (
    wallet_id           TEXT PRIMARY KEY,
    launch_id           TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    address             TEXT NOT NULL,
    chain               TEXT NOT NULL DEFAULT 'pi-network-soroban',
    lp_shares_pct       NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    permanently_locked  BOOLEAN NOT NULL DEFAULT FALSE,
    locked_at           TIMESTAMPTZ
);

CREATE TABLE lp_state_snapshot (
    snapshot_id       TEXT PRIMARY KEY,
    launch_id         TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    step_label        rollout_step NOT NULL,
    pi_reserve        NUMERIC(38, 8) NOT NULL,   -- x
    token_reserve     NUMERIC(38, 8) NOT NULL,   -- y
    lp_shares_holder  TEXT REFERENCES escrow_wallet(wallet_id),
    recorded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (launch_id, step_label)
);

CREATE TABLE price_analysis (
    analysis_id           TEXT PRIMARY KEY,
    launch_id             TEXT NOT NULL UNIQUE REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    k_invariant            NUMERIC(60, 8) NOT NULL,
    t_out                  NUMERIC(38, 8) NOT NULL,
    y_min                  NUMERIC(38, 8) NOT NULL,
    x_min                  NUMERIC(38, 8) NOT NULL,
    p_list                 NUMERIC(38, 12) NOT NULL,
    p_floor                NUMERIC(38, 12) NOT NULL,
    p_floor_pct_of_list    NUMERIC(6, 2) NOT NULL,
    computed_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE swap_event (
    event_id                  TEXT PRIMARY KEY,
    launch_id                 TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    chain                     TEXT NOT NULL DEFAULT 'pi-network-soroban',
    tx_hash                   TEXT NOT NULL UNIQUE,
    direction                 swap_direction NOT NULL,
    amount_in                 NUMERIC(38, 8) NOT NULL,
    amount_out                NUMERIC(38, 8) NOT NULL,
    pool_pi_reserve_after     NUMERIC(38, 8) NOT NULL,
    pool_token_reserve_after  NUMERIC(38, 8) NOT NULL,
    block_time                TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_snapshot_launch_step ON lp_state_snapshot (launch_id, step_label);
CREATE INDEX idx_swap_launch_time     ON swap_event (launch_id, block_time);

-- =============================================================================
-- SEED DATA (mirrors tge-state.mql.js — same numbers, same verified results)
-- =============================================================================

INSERT INTO launch_config (launch_id, project_name, design_variant, chain, committed_pi, launch_token_allocation, engagement_allocation, created_at) VALUES
('PIRC-D1-0001', 'PiRC Demo Launch (Design 1)', 'design_1', 'pi-network-soroban', 1000000, 1000000, 50000, '2026-01-10T00:00:00Z'),
('PIRC-D2-0001', 'PiRC Demo Launch (Design 2)', 'design_2', 'pi-network-soroban', 1000000, 1000000, NULL,  '2026-01-10T00:00:00Z');

INSERT INTO escrow_wallet (wallet_id, launch_id, address, chain, lp_shares_pct, permanently_locked, locked_at) VALUES
('ESCROW-D1-0001', 'PIRC-D1-0001', 'CESCROWD1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'pi-network-soroban', 100.00, TRUE, '2026-01-15T00:00:00Z'),
('ESCROW-D2-0001', 'PIRC-D2-0001', 'CESCROWD2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'pi-network-soroban', 100.00, TRUE, '2026-01-20T00:00:00Z');

-- Design 1: single deposit() at TGE
INSERT INTO lp_state_snapshot (snapshot_id, launch_id, step_label, pi_reserve, token_reserve, lp_shares_holder, recorded_at) VALUES
('SNAP-D1-TGE', 'PIRC-D1-0001', 'tge', 1000000, 1000000, 'ESCROW-D1-0001', '2026-01-15T00:05:00Z');

-- Design 2: phased step_2 -> step_3 (== tge)
INSERT INTO lp_state_snapshot (snapshot_id, launch_id, step_label, pi_reserve, token_reserve, lp_shares_holder, recorded_at) VALUES
('SNAP-D2-STEP2', 'PIRC-D2-0001', 'step_2', 500000,  800000, 'ESCROW-D2-0001', '2026-01-20T00:05:00Z'),
('SNAP-D2-STEP3', 'PIRC-D2-0001', 'step_3', 1000000, 400000, 'ESCROW-D2-0001', '2026-01-22T00:05:00Z'),
('SNAP-D2-TGE',   'PIRC-D2-0001', 'tge',    1000000, 400000, 'ESCROW-D2-0001', '2026-01-22T00:05:00Z');

INSERT INTO price_analysis (analysis_id, launch_id, k_invariant, t_out, y_min, x_min, p_list, p_floor, p_floor_pct_of_list, computed_at) VALUES
('PRICE-D1-0001', 'PIRC-D1-0001',
    1000000 * 1000000,
    1000000 + 50000,
    2*1000000 + 50000,
    (1000000 * 1000000) / (2*1000000 + 50000),
    1000000 / 1000000,
    ((1000000 * 1000000) / (2*1000000 + 50000)) / (2*1000000 + 50000),
    23.80, '2026-01-15T00:10:00Z'),
('PRICE-D2-0001', 'PIRC-D2-0001',
    1000000 * 400000,
    600000,
    1000000,
    400000,
    1000000.0 / 400000.0,
    400000.0 / 1000000.0,
    16.00, '2026-01-22T00:10:00Z');

INSERT INTO swap_event (event_id, launch_id, chain, tx_hash, direction, amount_in, amount_out, pool_pi_reserve_after, pool_token_reserve_after, block_time) VALUES
('SWAP-D1-0001', 'PIRC-D1-0001', 'pi-network-soroban', 'd1demo0000000000000000000000000000000000000000000001', 'token_to_pi', 10000, 9803.9, 990196.1, 1010000.0, '2026-01-16T09:00:00Z'),
('SWAP-D2-0001', 'PIRC-D2-0001', 'pi-network-soroban', 'd2demo0000000000000000000000000000000000000000000001', 'pi_to_token', 5000,  1976.3, 1005000.0, 398023.7, '2026-01-23T09:00:00Z');

-- =============================================================================
-- FUNCTIONS / VIEWS — live recomputation, cross-checked against seeded values
-- =============================================================================

CREATE OR REPLACE FUNCTION compute_price_floor(p_launch_id TEXT)
RETURNS TABLE (
    launch_id TEXT,
    design    design_variant,
    k         NUMERIC,
    t_out     NUMERIC,
    y_min     NUMERIC,
    x_min     NUMERIC,
    p_list    NUMERIC,
    p_floor   NUMERIC,
    p_floor_pct_of_list NUMERIC
) AS $$
DECLARE
    cfg   RECORD;
    tge   RECORD;
    v_t_out   NUMERIC;
    v_y_min   NUMERIC;
    v_x_min   NUMERIC;
    v_p_list  NUMERIC;
    v_p_floor NUMERIC;
BEGIN
    SELECT * INTO cfg FROM launch_config WHERE launch_config.launch_id = p_launch_id;
    SELECT * INTO tge FROM lp_state_snapshot
        WHERE lp_state_snapshot.launch_id = p_launch_id AND step_label = 'tge';

    IF cfg.design_variant = 'design_1' THEN
        v_t_out  := cfg.launch_token_allocation + COALESCE(cfg.engagement_allocation, 0);
        v_y_min  := tge.token_reserve + v_t_out;
        v_x_min  := (tge.pi_reserve * tge.token_reserve) / v_y_min;
        v_p_list := cfg.committed_pi / cfg.launch_token_allocation;
    ELSE -- design_2
        v_t_out  := cfg.launch_token_allocation - tge.token_reserve;
        v_y_min  := tge.token_reserve + v_t_out;   -- == launch_token_allocation
        v_x_min  := (tge.pi_reserve * tge.token_reserve) / v_y_min;
        v_p_list := cfg.committed_pi / tge.token_reserve;
    END IF;

    v_p_floor := v_x_min / v_y_min;

    RETURN QUERY SELECT
        p_launch_id,
        cfg.design_variant,
        tge.pi_reserve * tge.token_reserve,
        v_t_out,
        v_y_min,
        v_x_min,
        v_p_list,
        v_p_floor,
        ROUND((v_p_floor / v_p_list) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Sanity check: recomputed values should match the seeded price_analysis rows
-- SELECT * FROM compute_price_floor('PIRC-D1-0001');
-- SELECT * FROM compute_price_floor('PIRC-D2-0001');

CREATE OR REPLACE VIEW v_escrow_lock_audit AS
SELECT wallet_id, launch_id, address, permanently_locked
FROM escrow_wallet
WHERE permanently_locked = FALSE;  -- should always return zero rows

COMMIT;