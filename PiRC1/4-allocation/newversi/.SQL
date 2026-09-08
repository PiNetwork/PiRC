-- ============================================================
-- PiRC - Section 4: Allocation Period - v2.0.0
-- Unified schema for Design Option 1 (deposit-only) and
-- Design Option 2 (deposit + swap), with seeded demo data.
-- Target: PostgreSQL (uses NUMERIC for precision; adjust types
-- for MySQL/SQLite if needed).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Reference / metadata tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS allocation_document (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    version         TEXT NOT NULL,
    source_url      TEXT,
    next_section    TEXT
);

CREATE TABLE IF NOT EXISTS allocation_notation (
    symbol          TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    unit            TEXT,
    description     TEXT
);

-- ------------------------------------------------------------
-- 2. Projects (a project launches under ONE design option)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS allocation_project (
    project_id      TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    design_option   SMALLINT NOT NULL CHECK (design_option IN (1, 2)),
    total_tokens_T  NUMERIC(38, 8) NOT NULL CHECK (total_tokens_T > 0),
    total_pi_C      NUMERIC(38, 8) NOT NULL CHECK (total_pi_C > 0),
    chain           TEXT NOT NULL DEFAULT 'Pi Network (Stellar/Soroban)',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. Design Option 1 - token buckets & engagement tiers
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS design1_token_bucket (
    id              SERIAL PRIMARY KEY,
    bucket_name     TEXT NOT NULL,          -- 'purchase' | 'liquidity' | 'engage'
    fraction_of_T   NUMERIC(10, 6) NOT NULL,
    destination     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS design1_engagement_tier (
    id                  SERIAL PRIMARY KEY,
    tier                TEXT NOT NULL,       -- 'top' | 'middle' | 'bottom'
    rank_lower_fraction NUMERIC(6, 4) NOT NULL,
    rank_upper_fraction NUMERIC(6, 4) NOT NULL,
    engage_share        NUMERIC(6, 4) NOT NULL,   -- share of T_engage bucket
    avg_bonus_pct       NUMERIC(6, 3) NOT NULL,
    p_eff_over_p_list   NUMERIC(6, 4) NOT NULL
);

-- ------------------------------------------------------------
-- 4. Design Option 2 - token/Pi splits and step sequence
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS design2_split (
    id              SERIAL PRIMARY KEY,
    split_type      TEXT NOT NULL,          -- 'token' | 'pi'
    bucket_name     TEXT NOT NULL,          -- 'lp_portion' | 'fixed_price_portion' | 'bucket_A' | 'bucket_B'
    fraction        NUMERIC(6, 4) NOT NULL,
    destination     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS design2_step (
    step_number     SMALLINT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS design2_effective_price_curve (
    id              SERIAL PRIMARY KEY,
    s_fraction      NUMERIC(4, 3) NOT NULL,  -- cumulative swap, as multiple of C/2
    p_eff_norm      NUMERIC(6, 4) NOT NULL   -- p_eff(s) / p_list
);

-- ------------------------------------------------------------
-- 5. Participants (works for either design option)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS allocation_participant (
    id                      SERIAL PRIMARY KEY,
    project_id              TEXT NOT NULL REFERENCES allocation_project(project_id) ON DELETE CASCADE,
    participant_ref         TEXT NOT NULL,          -- external participant id
    pi_committed            NUMERIC(38, 8) NOT NULL CHECK (pi_committed > 0),
    engagement_rank_pct     NUMERIC(6, 4),           -- Design 1: 0.0 = most engaged
    s_cumulative            NUMERIC(38, 8),           -- Design 2: cumulative swap position
    UNIQUE (project_id, participant_ref)
);

-- Computed allocation results, populated by the calculator (app layer or trigger)
CREATE TABLE IF NOT EXISTS allocation_result (
    id                  SERIAL PRIMARY KEY,
    participant_id      INTEGER NOT NULL REFERENCES allocation_participant(id) ON DELETE CASCADE,
    tokens_base         NUMERIC(38, 8),
    tokens_bonus_or_swap NUMERIC(38, 8),
    tokens_total        NUMERIC(38, 8),
    effective_price     NUMERIC(38, 12),
    discount_pct        NUMERIC(6, 3),
    computed_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 6. Seed data
-- ------------------------------------------------------------

INSERT INTO allocation_document (title, version, source_url, next_section) VALUES
('PiRC - Section 4: Allocation Period', '2.0.0',
 'https://github.com/Tsukimarf/PiRC/tree/main/PiRC1/4-allocation', '5-tge-state')
ON CONFLICT DO NOTHING;

INSERT INTO allocation_notation (symbol, name, unit) VALUES
('T',        'Total Ecosystem Token Allocation',        'tokens'),
('C',        'Total Pi Committed',                       'Pi'),
('p_list',   'Listing Price',                            'Pi/token'),
('p_init',   'Initial LP Spot Price (Design 2)',         'Pi/token'),
('T_engage', 'Engagement Bonus Bucket (Design 1)',       'tokens')
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO design1_token_bucket (bucket_name, fraction_of_T, destination) VALUES
('purchase',  1.00, 'Participants (base allocation)'),
('liquidity', 1.00, 'Liquidity Pool (LP)'),
('engage',    0.05, 'Engagement bonus tiers');

INSERT INTO design1_engagement_tier (tier, rank_lower_fraction, rank_upper_fraction, engage_share, avg_bonus_pct, p_eff_over_p_list) VALUES
('top',    0.0000, 0.3333, 0.6667, 10.000, 0.9090),
('middle', 0.3333, 0.6667, 0.3333,  5.000, 0.9520),
('bottom', 0.6667, 1.0000, 0.0000,  0.000, 1.0000);

INSERT INTO design2_split (split_type, bucket_name, fraction, destination) VALUES
('token', 'lp_portion',          0.80, 'Liquidity Pool (LP)'),
('token', 'fixed_price_portion', 0.20, 'Sold at Listing Price to Pioneers'),
('pi',    'bucket_A',            0.50, 'Direct purchase of 20% of T at listing price'),
('pi',    'bucket_B',            0.50, 'Engagement-ranked swaps from LP');

INSERT INTO design2_step (step_number, name, description) VALUES
(1, 'Fixed-Price Delivery',              'Half of committed Pi (C/2) directly buys 20% of T at p_list = C/(0.4T).'),
(2, 'Escrow Deposit and Pool Creation',  'Pi from Step 1 paired with 80% of T is deposited into the LP; Escrow Wallet is permanently locked.'),
(3, 'Automated Engagement-Based Swaps',  'Remaining Pi (C/2) swapped in, ranked by Engagement Score, highest first, at incrementally rising prices.');

INSERT INTO design2_effective_price_curve (s_fraction, p_eff_norm) VALUES
(0.0, 0.400), (0.1, 0.465), (0.2, 0.529), (0.3, 0.594), (0.4, 0.658),
(0.5, 0.720), (0.6, 0.780), (0.7, 0.839), (0.8, 0.895), (0.9, 0.949), (1.0, 1.000);

-- Demo project 1: Design Option 1
INSERT INTO allocation_project (project_id, name, design_option, total_tokens_T, total_pi_C) VALUES
('demo-001', 'Demo Launch Alpha', 1, 1000000, 250000);

INSERT INTO allocation_participant (project_id, participant_ref, pi_committed, engagement_rank_pct) VALUES
('demo-001', 'p1', 5000, 0.05),
('demo-001', 'p2', 2000, 0.40),
('demo-001', 'p3', 1000, 0.85);

-- Demo project 2: Design Option 2
INSERT INTO allocation_project (project_id, name, design_option, total_tokens_T, total_pi_C) VALUES
('demo-002', 'Demo Launch Beta', 2, 1000000, 400000);

INSERT INTO allocation_participant (project_id, participant_ref, pi_committed, s_cumulative) VALUES
('demo-002', 'p1', 1000, 0),
('demo-002', 'p2', 1000, 100000),
('demo-002', 'p3', 1000, 200000);

COMMIT;

-- ------------------------------------------------------------
-- 7. Example queries
-- ------------------------------------------------------------

-- Listing price for a Design 1 project: p_list = C / T
-- SELECT total_pi_C / total_tokens_T AS p_list FROM allocation_project WHERE project_id = 'demo-001';

-- Listing price for a Design 2 project: p_list = C / (0.4 * T)
-- SELECT total_pi_C / (0.4 * total_tokens_T) AS p_list FROM allocation_project WHERE project_id = 'demo-002';

-- Participants ranked by engagement for a Design 1 project
-- SELECT participant_ref, pi_committed, engagement_rank_pct
-- FROM allocation_participant WHERE project_id = 'demo-001' ORDER BY engagement_rank_pct ASC;
