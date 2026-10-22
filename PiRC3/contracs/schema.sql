-- PiRC3 - off-chain log of PIRC3Exchange swaps
-- Run with: sqlite3 pirc3.db < contracts/exchange_schema.sql

CREATE TABLE IF NOT EXISTS exchange_swaps (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash         TEXT    NOT NULL,
    log_index       INTEGER NOT NULL,
    block_number    INTEGER NOT NULL,
    user_address    TEXT    NOT NULL,
    token_in        TEXT    NOT NULL,
    amount_in       TEXT    NOT NULL,   -- uint256 as string
    amount_out      TEXT    NOT NULL,   -- uint256 as string
    exchange_addr   TEXT    NOT NULL,
    logged_at       TEXT    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tx_hash, log_index)
);

CREATE TABLE IF NOT EXISTS exchange_liquidity_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash         TEXT    NOT NULL,
    log_index       INTEGER NOT NULL,
    block_number    INTEGER NOT NULL,
    event_type      TEXT    NOT NULL CHECK (event_type IN ('added','removed')),
    token_address   TEXT    NOT NULL,
    recipient       TEXT,
    amount          TEXT    NOT NULL,
    logged_at       TEXT    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_swaps_user ON exchange_swaps(user_address);
CREATE INDEX IF NOT EXISTS idx_swaps_block ON exchange_swaps(block_number);
