-- =============================================================================
-- PiRC1 / 4-allocation — Database Layer (SQL / PostgreSQL twin of allocation-state.mql.js)
-- =============================================================================
-- Relational mirror of the MongoDB (MQL) schema so the Allocation Period model
-- is usable from either a document store or a relational one without drift.
-- Chain-agnostic: designed for Pi Network (Stellar/Soroban) by default.
-- Feeds into 5-tge-state via launch_id / escrow wallet_id.
-- =============================================================================

BEGIN;

CREATE TYPE design_variant  AS ENUM ('design_1', 'design_2');
CREATE TYPE engagement_tier AS ENUM ('top', 'mid', 'bottom');

CREATE TABLE launch_config (
    launch_id       TEXT PRIMARY KEY,
    project_name    TEXT NOT NULL,
    design_variant  design_variant NOT NULL,
    chain           TEXT NOT NULL DEFAULT 'pi-network-soroban',
    committed_pi    NUMERIC(38, 8) NOT NULL,          -- C
    -- design_1 only
    t_purchase      NUMERIC(38, 8),                   -- T
    t_liquidity     NUMERIC(38, 8),                    -- T
    t_engage        NUMERIC(38, 8),                    -- 5% of T
    -- design_2 only
    t_total         NUMERIC(38, 8),                    -- T (full launch allocation)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT design1_fields_check CHECK (
        design_variant <> 'design_1' OR (t_purchase IS NOT NULL AND t_liquidity IS NOT NULL AND t_engage IS NOT NULL)
    ),
    CONSTRAINT design2_fields_check CHECK (
        design_variant <> 'design_2' OR t_total IS NOT NULL
    )
);

CREATE TABLE participant (
    participant_id    TEXT PRIMARY KEY,
    launch_id         TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    committed_pi      NUMERIC(38, 8) NOT NULL,        -- c_i
    engagement_score  NUMERIC(6, 2) NOT NULL,
    engagement_rank   INT NOT NULL,                    -- 1 = most engaged
    engagement_tier   engagement_tier,                 -- design_1 only
    UNIQUE (launch_id, engagement_rank)
);

CREATE TABLE allocation_result (
    participant_id     TEXT PRIMARY KEY REFERENCES participant(participant_id) ON DELETE CASCADE,
    launch_id          TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    base_tokens        NUMERIC(38, 8) NOT NULL,        -- t_i^base
    engagement_tokens  NUMERIC(38, 8),                 -- design_1: t_i^engage
    effective_price    NUMERIC(38, 12),                -- p_eff,i
    lockup_days        INT                             -- design_2: lockup on discounted portion
);

CREATE TABLE escrow_wallet (
    wallet_id           TEXT PRIMARY KEY,
    launch_id           TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    address             TEXT NOT NULL,
    chain               TEXT NOT NULL DEFAULT 'pi-network-soroban',
    pi_deposited        NUMERIC(38, 8) NOT NULL,
    tokens_deposited    NUMERIC(38, 8) NOT NULL,
    permanently_locked  BOOLEAN NOT NULL DEFAULT FALSE,
    locked_at           TIMESTAMPTZ
);

CREATE TABLE swap_execution (
    swap_id           TEXT PRIMARY KEY,
    launch_id         TEXT NOT NULL REFERENCES launch_config(launch_id) ON DELETE CASCADE,
    participant_id    TEXT NOT NULL REFERENCES participant(participant_id) ON DELETE CASCADE,
    engagement_rank   INT NOT NULL,
    cumulative_s      NUMERIC(38, 8) NOT NULL,   -- s, design_2 only
    pi_swapped        NUMERIC(38, 8) NOT NULL,
    tokens_received   NUMERIC(38, 8) NOT NULL,
    swap_price        NUMERIC(38, 12) NOT NULL,   -- p_swap(s)
    effective_price   NUMERIC(38, 12) NOT NULL,   -- p_eff(s)
    lockup_days       INT NOT NULL
);

CREATE INDEX idx_participant_launch_rank ON participant (launch_id, engagement_rank);
CREATE INDEX idx_swap_launch_rank        ON swap_execution (launch_id, engagement_rank);

-- =============================================================================
-- SEED DATA (mirrors allocation-state.mql.js — same launch_ids and numbers)
-- =============================================================================

INSERT INTO launch_config (launch_id, project_name, design_variant, chain, committed_pi, t_purchase, t_liquidity, t_engage, t_total, created_at) VALUES
('PIRC-D1-ALLOC-0001', 'PiRC Demo Launch (Design 1)', 'design_1', 'pi-network-soroban', 300000, 300000, 300000, 15000, NULL, '2026-01-05T00:00:00Z'),
('PIRC-D2-ALLOC-0001', 'PiRC Demo Launch (Design 2)', 'design_2', 'pi-network-soroban', 1000000, NULL, NULL, NULL, 1000000, '2026-01-10T00:00:00Z');

-- Design 1: three participants, one per tier
INSERT INTO participant (participant_id, launch_id, committed_pi, engagement_score, engagement_rank, engagement_tier) VALUES
('P-D1-TOP', 'PIRC-D1-ALLOC-0001', 100000, 95.0, 1, 'top'),
('P-D1-MID', 'PIRC-D1-ALLOC-0001', 100000, 55.0, 2, 'mid'),
('P-D1-LOW', 'PIRC-D1-ALLOC-0001', 100000, 10.0, 3, 'bottom');

INSERT INTO escrow_wallet (wallet_id, launch_id, address, chain, pi_deposited, tokens_deposited, permanently_locked, locked_at) VALUES
('ESCROW-D1-ALLOC-0001', 'PIRC-D1-ALLOC-0001', 'CESCROWD1ALLOCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'pi-network-soroban', 300000, 300000, TRUE, '2026-01-06T00:00:00Z');

-- Design 2: five participants ranked by engagement
INSERT INTO participant (participant_id, launch_id, committed_pi, engagement_score, engagement_rank, engagement_tier) VALUES
('P-D2-R1', 'PIRC-D2-ALLOC-0001', 100000, 99.0, 1, NULL),
('P-D2-R2', 'PIRC-D2-ALLOC-0001', 100000, 80.0, 2, NULL),
('P-D2-R3', 'PIRC-D2-ALLOC-0001', 100000, 60.0, 3, NULL),
('P-D2-R4', 'PIRC-D2-ALLOC-0001', 100000, 40.0, 4, NULL),
('P-D2-R5', 'PIRC-D2-ALLOC-0001', 100000, 20.0, 5, NULL);

INSERT INTO escrow_wallet (wallet_id, launch_id, address, chain, pi_deposited, tokens_deposited, permanently_locked, locked_at) VALUES
('ESCROW-D2-ALLOC-0001', 'PIRC-D2-ALLOC-0001', 'CESCROWD2ALLOCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'pi-network-soroban', 500000, 800000, TRUE, '2026-01-11T00:00:00Z');

-- =============================================================================
-- FUNCTIONS / VIEWS — live recomputation, matching the closed-form design docs
-- =============================================================================

-- 1) Design 1: base tokens, engagement bonus and effective price per participant
CREATE OR REPLACE FUNCTION compute_design1_allocation(p_launch_id TEXT)
RETURNS TABLE (
    participant_id  TEXT,
    tier            engagement_tier,
    t_i_base        NUMERIC,
    t_i_engage      NUMERIC,
    p_list          NUMERIC,
    p_eff           NUMERIC,
    p_eff_over_p_list NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH cfg AS (
        SELECT * FROM launch_config WHERE launch_config.launch_id = p_launch_id
    ),
    tier_totals AS (
        SELECT engagement_tier AS tier, SUM(committed_pi) AS tier_committed_pi
        FROM participant
        WHERE participant.launch_id = p_launch_id
        GROUP BY engagement_tier
    ),
    base AS (
        SELECT
            p.participant_id,
            p.engagement_tier AS tier,
            p.committed_pi,
            (cfg.committed_pi / cfg.t_purchase) AS p_list,
            p.committed_pi / (cfg.committed_pi / cfg.t_purchase) AS t_i_base
        FROM participant p, cfg
        WHERE p.launch_id = p_launch_id
    )
    SELECT
        base.participant_id,
        base.tier,
        base.t_i_base,
        CASE base.tier
            WHEN 'top' THEN (2.0/3.0) * cfg.t_engage * (base.committed_pi / tt.tier_committed_pi)
            WHEN 'mid' THEN (1.0/3.0) * cfg.t_engage * (base.committed_pi / tt.tier_committed_pi)
            ELSE 0
        END AS t_i_engage,
        base.p_list,
        base.committed_pi / (
            base.t_i_base + CASE base.tier
                WHEN 'top' THEN (2.0/3.0) * cfg.t_engage * (base.committed_pi / tt.tier_committed_pi)
                WHEN 'mid' THEN (1.0/3.0) * cfg.t_engage * (base.committed_pi / tt.tier_committed_pi)
                ELSE 0
            END
        ) AS p_eff,
        (base.committed_pi / (
            base.t_i_base + CASE base.tier
                WHEN 'top' THEN (2.0/3.0) * cfg.t_engage * (base.committed_pi / tt.tier_committed_pi)
                WHEN 'mid' THEN (1.0/3.0) * cfg.t_engage * (base.committed_pi / tt.tier_committed_pi)
                ELSE 0
            END
        )) / base.p_list AS p_eff_over_p_list
    FROM base
    JOIN cfg ON TRUE
    JOIN tier_totals tt ON tt.tier = base.tier
    ORDER BY p_eff_over_p_list;
END;
$$ LANGUAGE plpgsql;

-- Sanity check: SELECT * FROM compute_design1_allocation('PIRC-D1-ALLOC-0001');
-- Expect p_eff_over_p_list ≈ 0.909 (top), 0.952 (mid), 1.000 (bottom)

-- 2) Design 2: reconstructs the ranked-swap curve p_swap(s)/p_list and p_eff(s)
CREATE OR REPLACE FUNCTION compute_design2_swap_curve(p_launch_id TEXT)
RETURNS TABLE (
    participant_id      TEXT,
    engagement_rank     INT,
    s                   NUMERIC,
    p_swap_over_p_list  NUMERIC,
    p_eff_over_p_list   NUMERIC
) AS $$
DECLARE
    v_C NUMERIC;
    v_T NUMERIC;
    v_p_list NUMERIC;
    v_half_C NUMERIC;
    v_n INT;
BEGIN
    SELECT committed_pi, t_total INTO v_C, v_T FROM launch_config WHERE launch_id = p_launch_id;
    v_p_list := v_C / (0.4 * v_T);
    v_half_C := v_C / 2;
    SELECT COUNT(*) INTO v_n FROM participant WHERE participant.launch_id = p_launch_id;

    RETURN QUERY
    WITH ranked AS (
        SELECT
            p.participant_id,
            p.engagement_rank,
            (ROW_NUMBER() OVER (ORDER BY p.engagement_rank) - 1) AS idx
        FROM participant p
        WHERE p.launch_id = p_launch_id
    ),
    curve AS (
        SELECT
            ranked.participant_id,
            ranked.engagement_rank,
            v_half_C * (ranked.idx::NUMERIC / (v_n - 1)) AS s
        FROM ranked
    )
    SELECT
        curve.participant_id,
        curve.engagement_rank,
        curve.s,
        ROUND(POWER(0.5 + curve.s / v_C, 2), 3) AS p_swap_over_p_list,
        ROUND(
            (2 * v_p_list * (POWER(0.5 + curve.s / v_C, 2) * v_p_list)) /
            (v_p_list + (POWER(0.5 + curve.s / v_C, 2) * v_p_list)) / v_p_list
        , 3) AS p_eff_over_p_list
    FROM curve
    ORDER BY curve.engagement_rank;
END;
$$ LANGUAGE plpgsql;

-- Sanity check: SELECT * FROM compute_design2_swap_curve('PIRC-D2-ALLOC-0001');
-- Expect p_eff_over_p_list to range from ~0.400 (rank 1) to ~1.000 (last rank)

CREATE OR REPLACE VIEW v_escrow_lock_audit AS
SELECT wallet_id, launch_id, address, permanently_locked
FROM escrow_wallet
WHERE permanently_locked = FALSE;  -- should always return zero rows

COMMIT;
