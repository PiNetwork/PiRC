-- =====================================================================
--  BodyFail Database — v2 "Composition" schema
--  Pi-Nexsus / PiRC algorithmic trading module
--  Candlestick body/wick decomposition + body-failure signal detection
--  Target: PostgreSQL 13+ (SQLite-compatible subset noted where relevant)
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 0. Reference / lookup tables
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bodyfail_symbols (
    symbol_id       SERIAL PRIMARY KEY,
    symbol          VARCHAR(20)  NOT NULL UNIQUE,
    asset_class     VARCHAR(20)  NOT NULL DEFAULT 'crypto',   -- crypto | fx | index
    pip_size        NUMERIC(18,8) NOT NULL DEFAULT 0.00000001,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bodyfail_timeframes (
    timeframe_id    SERIAL PRIMARY KEY,
    code            VARCHAR(5)   NOT NULL UNIQUE,   -- M1, M5, M15, H1, H4, D1
    minutes         INTEGER      NOT NULL
);

-- ---------------------------------------------------------------------
-- 1. bodyfail_compositions
--    One row per candle: full body/wick decomposition + classification.
--    This is the "compositions body" table — the new artifact in v2.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bodyfail_compositions (
    composition_id      BIGSERIAL PRIMARY KEY,
    symbol              VARCHAR(20)  NOT NULL,
    timeframe           VARCHAR(5)   NOT NULL,
    candle_time         TIMESTAMPTZ  NOT NULL,

    open                NUMERIC(18,8) NOT NULL,
    high                NUMERIC(18,8) NOT NULL,
    low                 NUMERIC(18,8) NOT NULL,
    close                NUMERIC(18,8) NOT NULL,
    volume              NUMERIC(18,4) NOT NULL DEFAULT 0,

    range_size          NUMERIC(18,8) NOT NULL,   -- high - low
    body_size           NUMERIC(18,8) NOT NULL,   -- |close - open|
    body_ratio          NUMERIC(6,5)  NOT NULL,   -- body_size / range_size
    upper_wick          NUMERIC(18,8) NOT NULL,
    upper_wick_ratio    NUMERIC(6,5)  NOT NULL,
    lower_wick          NUMERIC(18,8) NOT NULL,
    lower_wick_ratio    NUMERIC(6,5)  NOT NULL,

    direction           VARCHAR(8)   NOT NULL CHECK (direction IN ('bullish','bearish','flat')),
    body_type           VARCHAR(20)  NOT NULL CHECK (body_type IN (
                             'doji','marubozu','hammer','hanging_man',
                             'shooting_star','inverted_hammer',
                             'spinning_top','normal','flat')),

    is_bodyfail_trigger BOOLEAN      NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_composition UNIQUE (symbol, timeframe, candle_time)
);

CREATE INDEX IF NOT EXISTS ix_comp_symbol_tf_time
    ON bodyfail_compositions (symbol, timeframe, candle_time DESC);
CREATE INDEX IF NOT EXISTS ix_comp_body_type
    ON bodyfail_compositions (body_type);
CREATE INDEX IF NOT EXISTS ix_comp_trigger
    ON bodyfail_compositions (is_bodyfail_trigger) WHERE is_bodyfail_trigger;

-- ---------------------------------------------------------------------
-- 2. bodyfail_events
--    A trigger candle (strong body) whose move gets reversed by a
--    subsequent confirmation candle beyond the retracement threshold.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bodyfail_events (
    event_id            BIGSERIAL PRIMARY KEY,
    symbol               VARCHAR(20)  NOT NULL,
    timeframe            VARCHAR(5)   NOT NULL,

    trigger_composition_id  BIGINT NOT NULL REFERENCES bodyfail_compositions(composition_id),
    confirm_composition_id  BIGINT REFERENCES bodyfail_compositions(composition_id),

    direction_failed     VARCHAR(8)   NOT NULL CHECK (direction_failed IN ('bullish','bearish')),
    trigger_body_ratio    NUMERIC(6,5) NOT NULL,
    retracement_ratio     NUMERIC(10,5),           -- how far price gave back, 0..1+
    confidence            NUMERIC(6,5) NOT NULL,  -- 0..1 composite score
    status                VARCHAR(12)  NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','confirmed','invalidated')),

    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    resolved_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_events_symbol_tf
    ON bodyfail_events (symbol, timeframe, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_events_status
    ON bodyfail_events (status);

-- ---------------------------------------------------------------------
-- 3. bodyfail_labels
--    Manual / automated labeling of events for model training.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bodyfail_labels (
    label_id       BIGSERIAL PRIMARY KEY,
    event_id       BIGINT      NOT NULL REFERENCES bodyfail_events(event_id) ON DELETE CASCADE,
    label          VARCHAR(15) NOT NULL CHECK (label IN
                        ('true_positive','false_positive','unlabeled')),
    labeled_by     VARCHAR(50) NOT NULL DEFAULT 'system',
    labeled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes          TEXT
);

CREATE INDEX IF NOT EXISTS ix_labels_event ON bodyfail_labels (event_id);

-- ---------------------------------------------------------------------
-- 4. bodyfail_stats
--    Rolling aggregate stats per symbol/timeframe/period.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bodyfail_stats (
    stat_id             BIGSERIAL PRIMARY KEY,
    symbol              VARCHAR(20) NOT NULL,
    timeframe           VARCHAR(5)  NOT NULL,
    period_start        TIMESTAMPTZ NOT NULL,
    period_end          TIMESTAMPTZ NOT NULL,

    total_candles       INTEGER NOT NULL DEFAULT 0,
    total_events        INTEGER NOT NULL DEFAULT 0,
    success_count        INTEGER NOT NULL DEFAULT 0,   -- true_positive
    fail_count           INTEGER NOT NULL DEFAULT 0,   -- false_positive
    success_rate          NUMERIC(6,5),
    avg_body_ratio        NUMERIC(6,5),
    avg_confidence         NUMERIC(6,5),

    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_stats_period UNIQUE (symbol, timeframe, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS ix_stats_symbol_tf
    ON bodyfail_stats (symbol, timeframe, period_start DESC);

-- ---------------------------------------------------------------------
-- 5. Convenience view: event detail joined with its two candles
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW v_bodyfail_event_detail AS
SELECT
    e.event_id,
    e.symbol,
    e.timeframe,
    e.direction_failed,
    e.trigger_body_ratio,
    e.retracement_ratio,
    e.confidence,
    e.status,
    tc.candle_time  AS trigger_time,
    tc.body_type    AS trigger_body_type,
    cc.candle_time  AS confirm_time,
    cc.body_type    AS confirm_body_type,
    l.label
FROM bodyfail_events e
JOIN bodyfail_compositions tc ON tc.composition_id = e.trigger_composition_id
LEFT JOIN bodyfail_compositions cc ON cc.composition_id = e.confirm_composition_id
LEFT JOIN LATERAL (
    SELECT label FROM bodyfail_labels
    WHERE event_id = e.event_id
    ORDER BY labeled_at DESC LIMIT 1
) l ON TRUE;

COMMIT;

-- =====================================================================
-- SEED / DEMO DATA
-- =====================================================================

BEGIN;

INSERT INTO bodyfail_symbols (symbol, asset_class, pip_size) VALUES
    ('PIUSD',  'crypto', 0.0001),
    ('BTCUSD', 'crypto', 0.01),
    ('ETHUSD', 'crypto', 0.01),
    ('EURUSD', 'fx',     0.00001)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO bodyfail_timeframes (code, minutes) VALUES
    ('M1', 1), ('M5', 5), ('M15', 15), ('H1', 60), ('H4', 240), ('D1', 1440)
ON CONFLICT (code) DO NOTHING;

-- 12 seed candles for PIUSD / M15: mix of marubozu, doji, hammer, spinning top
INSERT INTO bodyfail_compositions
    (symbol, timeframe, candle_time, open, high, low, close, volume,
     range_size, body_size, body_ratio, upper_wick, upper_wick_ratio,
     lower_wick, lower_wick_ratio, direction, body_type, is_bodyfail_trigger)
VALUES
    ('PIUSD','M15','2026-09-08 00:00:00+00', 0.6500, 0.6620, 0.6495, 0.6610, 15320,
     0.0125, 0.0110, 0.88000, 0.0010, 0.08000, 0.0005, 0.04000, 'bullish', 'marubozu', TRUE),

    ('PIUSD','M15','2026-09-08 00:15:00+00', 0.6610, 0.6615, 0.6540, 0.6555, 9870,
     0.0075, 0.0055, 0.73333, 0.0005, 0.06667, 0.0015, 0.20000, 'bearish', 'normal', FALSE),

    ('PIUSD','M15','2026-09-08 00:30:00+00', 0.6555, 0.6560, 0.6510, 0.6552, 7200,
     0.0050, 0.0003, 0.06000, 0.0005, 0.10000, 0.0042, 0.84000, 'bearish', 'doji', FALSE),

    ('PIUSD','M15','2026-09-08 00:45:00+00', 0.6552, 0.6600, 0.6548, 0.6558, 8800,
     0.0052, 0.0006, 0.11538, 0.0042, 0.80769, 0.0004, 0.07692, 'bullish', 'shooting_star', FALSE),

    ('PIUSD','M15','2026-09-08 01:00:00+00', 0.6558, 0.6562, 0.6470, 0.6555, 11200,
     0.0092, 0.0003, 0.03261, 0.0004, 0.04348, 0.0085, 0.92391, 'bearish', 'hammer', TRUE),

    ('PIUSD','M15','2026-09-08 01:15:00+00', 0.6555, 0.6640, 0.6550, 0.6635, 16400,
     0.0090, 0.0080, 0.88889, 0.0005, 0.05556, 0.0005, 0.05556, 'bullish', 'marubozu', TRUE),

    ('PIUSD','M15','2026-09-08 01:30:00+00', 0.6635, 0.6642, 0.6560, 0.6572, 13100,
     0.0082, 0.0063, 0.76829, 0.0007, 0.08537, 0.0012, 0.14634, 'bearish', 'normal', FALSE),

    ('PIUSD','M15','2026-09-08 01:45:00+00', 0.6572, 0.6600, 0.6545, 0.6590, 6900,
     0.0055, 0.0018, 0.32727, 0.0010, 0.18182, 0.0027, 0.49091, 'bullish', 'spinning_top', FALSE),

    ('BTCUSD','H1','2026-09-08 00:00:00+00', 58210.0, 58890.0, 58150.0, 58840.0, 421.5,
     740.0, 630.0, 0.85135, 50.0, 0.06757, 60.0, 0.08108, 'bullish', 'marubozu', TRUE),

    ('BTCUSD','H1','2026-09-08 01:00:00+00', 58840.0, 58910.0, 58020.0, 58260.0, 388.2,
     890.0, 580.0, 0.65169, 70.0, 0.07865, 240.0, 0.26966, 'bearish', 'normal', TRUE),

    ('ETHUSD','H1','2026-09-08 00:00:00+00', 2510.0, 2515.0, 2470.0, 2512.0, 902.0,
     45.0, 2.0, 0.04444, 3.0, 0.06667, 40.0, 0.88889, 'bullish', 'hammer', FALSE),

    ('EURUSD','H4','2026-09-08 00:00:00+00', 1.0850, 1.0855, 1.0790, 1.0793, 0,
     0.0065, 0.0057, 0.87692, 0.0005, 0.07692, 0.0003, 0.04615, 'bearish', 'marubozu', TRUE)
ON CONFLICT (symbol, timeframe, candle_time) DO NOTHING;

-- Seed events derived from the trigger candles above (trigger -> next candle confirms fail)
INSERT INTO bodyfail_events
    (symbol, timeframe, trigger_composition_id, confirm_composition_id,
     direction_failed, trigger_body_ratio, retracement_ratio, confidence, status)
SELECT
    t.symbol, t.timeframe, t.composition_id, c.composition_id,
    t.direction, t.body_ratio,
    ABS(c.close - t.close) / NULLIF(t.body_size, 0),
    LEAST(1.0, t.body_ratio * 0.6 + 0.4),
    'confirmed'
FROM bodyfail_compositions t
JOIN bodyfail_compositions c
  ON c.symbol = t.symbol AND c.timeframe = t.timeframe
 AND c.candle_time = t.candle_time + (
        CASE t.timeframe WHEN 'M15' THEN interval '15 min'
                          WHEN 'H1'  THEN interval '1 hour'
                          WHEN 'H4'  THEN interval '4 hour'
                          ELSE interval '1 day' END)
WHERE t.is_bodyfail_trigger
  AND ((t.direction = 'bullish' AND c.close < t.close)
    OR (t.direction = 'bearish' AND c.close > t.close))
ON CONFLICT DO NOTHING;

INSERT INTO bodyfail_labels (event_id, label, labeled_by, notes)
SELECT event_id, 'true_positive', 'seed_demo', 'Auto-labeled from seed data reversal'
FROM bodyfail_events;

INSERT INTO bodyfail_stats
    (symbol, timeframe, period_start, period_end, total_candles, total_events,
     success_count, fail_count, success_rate, avg_body_ratio, avg_confidence)
VALUES
    ('PIUSD','M15','2026-09-08 00:00:00+00','2026-09-08 02:00:00+00', 8, 2, 2, 0, 1.00000, 0.47097, 0.71429),
    ('BTCUSD','H1','2026-09-08 00:00:00+00','2026-09-08 02:00:00+00', 2, 2, 2, 0, 1.00000, 0.75152, 0.79104)
ON CONFLICT (symbol, timeframe, period_start, period_end) DO NOTHING;

COMMIT;

-- ---------------------------------------------------------------------
-- SQLite-compatible notes:
--   * Replace SERIAL / BIGSERIAL with INTEGER PRIMARY KEY AUTOINCREMENT
--   * Replace TIMESTAMPTZ with TEXT (ISO-8601) or INTEGER (unix epoch)
--   * Replace LATERAL join in the view with a correlated subquery
--   * NUMERIC types map directly; CHECK constraints are supported as-is
-- ---------------------------------------------------------------------
