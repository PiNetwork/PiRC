-- PiRC3 - multi-chain ERC20 / BEP20 / SPL transfer log
-- Solana (SPL) rows: chain='solana', tx_hash=signature, block_number=slot,
-- token_address=mint. Solana addresses are case-sensitive base58 (never lowercase them).
-- Run with: sqlite3 pirc3.db < contracts/safetransfer_schema.sql

CREATE TABLE IF NOT EXISTS safetransfer_log (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    chain          TEXT    NOT NULL,                       -- 'ethereum', 'bsc', ...
    standard       TEXT    NOT NULL CHECK (standard IN ('ERC20','BEP20','SPL')),
    token_address  TEXT    NOT NULL,
    tx_hash        TEXT    NOT NULL,
    log_index      INTEGER NOT NULL,
    block_number   INTEGER NOT NULL,
    from_address   TEXT    NOT NULL,
    to_address     TEXT    NOT NULL,
    amount         TEXT    NOT NULL,                       -- uint256 as decimal string
    logged_at      TEXT    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (chain, tx_hash, log_index)
);

-- Remembers how far each token has been scanned so runs can resume
CREATE TABLE IF NOT EXISTS indexer_checkpoints (
    chain          TEXT    NOT NULL,
    token_address  TEXT    NOT NULL,
    last_block     INTEGER NOT NULL,
    updated_at     TEXT    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chain, token_address)
);

CREATE INDEX IF NOT EXISTS idx_stl_from  ON safetransfer_log(chain, from_address);
CREATE INDEX IF NOT EXISTS idx_stl_to    ON safetransfer_log(chain, to_address);
CREATE INDEX IF NOT EXISTS idx_stl_block ON safetransfer_log(chain, block_number);
