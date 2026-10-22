-- Upgrade an EXISTING pirc3.db so safetransfer_log accepts standard = 'SPL'.
-- (SQLite cannot alter a CHECK constraint, so the table is rebuilt; data is kept.)
-- Run with: sqlite3 pirc3.db < contracts/migrations/001_add_spl.sql
-- Back up pirc3.db first.

BEGIN;

ALTER TABLE safetransfer_log RENAME TO safetransfer_log_old;
DROP INDEX IF EXISTS idx_stl_from;
DROP INDEX IF EXISTS idx_stl_to;
DROP INDEX IF EXISTS idx_stl_block;

CREATE TABLE safetransfer_log (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    chain          TEXT    NOT NULL,
    standard       TEXT    NOT NULL CHECK (standard IN ('ERC20','BEP20','SPL')),
    token_address  TEXT    NOT NULL,
    tx_hash        TEXT    NOT NULL,
    log_index      INTEGER NOT NULL,
    block_number   INTEGER NOT NULL,
    from_address   TEXT    NOT NULL,
    to_address     TEXT    NOT NULL,
    amount         TEXT    NOT NULL,
    logged_at      TEXT    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (chain, tx_hash, log_index)
);

INSERT INTO safetransfer_log
    (id, chain, standard, token_address, tx_hash, log_index, block_number,
     from_address, to_address, amount, logged_at)
SELECT id, chain, standard, token_address, tx_hash, log_index, block_number,
       from_address, to_address, amount, logged_at
FROM safetransfer_log_old;

DROP TABLE safetransfer_log_old;

CREATE INDEX idx_stl_from  ON safetransfer_log(chain, from_address);
CREATE INDEX idx_stl_to    ON safetransfer_log(chain, to_address);
CREATE INDEX idx_stl_block ON safetransfer_log(chain, block_number);

COMMIT;
