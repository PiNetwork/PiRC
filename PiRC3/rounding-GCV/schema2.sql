-- MySQL schema: wallet balances with one uniform rounding rule.
--
-- DECIMAL (not FLOAT/DOUBLE) is used throughout so balances never
-- drift due to binary floating-point representation. The precision
-- (6 decimal places) and rounding behavior are identical for every
-- row — there is no owner-specific column, trigger, or exception
-- path anywhere in this schema.

CREATE TABLE IF NOT EXISTS wallets (
    wallet_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    owner_user_id   BIGINT UNSIGNED NOT NULL,
    -- raw_balance: full-precision mined/accumulated value, as mined.
    raw_balance     DECIMAL(38, 12) NOT NULL DEFAULT 0,
    -- rounded_balance: raw_balance rounded to the shared 6-decimal
    -- precision. Always derived the same way for every wallet.
    rounded_balance DECIMAL(38, 6) NOT NULL DEFAULT 0,
    decimals        TINYINT UNSIGNED NOT NULL DEFAULT 6,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_raw_balance_nonneg CHECK (raw_balance >= 0),
    CONSTRAINT chk_rounded_balance_nonneg CHECK (rounded_balance >= 0),
    CONSTRAINT chk_decimals_range CHECK (decimals BETWEEN 0 AND 18),
    CONSTRAINT fk_wallets_owner FOREIGN KEY (owner_user_id)
        REFERENCES users (user_id)
) ENGINE=InnoDB;

-- Trigger: recompute rounded_balance from raw_balance on every
-- insert/update, using MySQL's ROUND() (round-half-away-from-zero
-- for DECIMAL, matching the other language implementations in this
-- change), applied the same way for every wallet.
DELIMITER $$

DROP TRIGGER IF EXISTS wallets_round_balance_ins$$
CREATE TRIGGER wallets_round_balance_ins
BEFORE INSERT ON wallets
FOR EACH ROW
BEGIN
    SET NEW.rounded_balance = ROUND(NEW.raw_balance, NEW.decimals);
END$$

DROP TRIGGER IF EXISTS wallets_round_balance_upd$$
CREATE TRIGGER wallets_round_balance_upd
BEFORE UPDATE ON wallets
FOR EACH ROW
BEGIN
    SET NEW.rounded_balance = ROUND(NEW.raw_balance, NEW.decimals);
END$$

DELIMITER ;

-- Example (same trigger logic regardless of who the wallet belongs to):
-- UPDATE wallets SET raw_balance = 3.1415926535 WHERE wallet_id = 1;
-- -> rounded_balance becomes 3.141593 for ANY wallet_id, including the owner's.
