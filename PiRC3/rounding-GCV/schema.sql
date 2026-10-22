-- PostgreSQL schema: wallet balances with one uniform rounding rule.
--
-- NUMERIC (not FLOAT/DOUBLE) is used throughout so balances never
-- drift due to binary floating-point representation. The precision
-- (6 decimal places) and rounding behavior are identical for every
-- row — there is no owner-specific column, trigger, or exception
-- path anywhere in this schema.

CREATE TABLE IF NOT EXISTS wallets (
    wallet_id       BIGSERIAL PRIMARY KEY,
    owner_user_id   BIGINT NOT NULL REFERENCES users(user_id),
    -- raw_balance: full-precision mined/accumulated value, as mined.
    raw_balance     NUMERIC(38, 12) NOT NULL DEFAULT 0
                        CHECK (raw_balance >= 0),
    -- rounded_balance: raw_balance rounded to the shared 6-decimal
    -- precision. Always derived the same way for every wallet.
    rounded_balance NUMERIC(38, 6) NOT NULL DEFAULT 0
                        CHECK (rounded_balance >= 0),
    decimals        SMALLINT NOT NULL DEFAULT 6
                        CHECK (decimals >= 0 AND decimals <= 18),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Single shared rounding function (round-half-up, away from zero —
-- PostgreSQL's ROUND(numeric, int) already rounds half away from
-- zero for NUMERIC, which matches the TypeScript/Go/Python/C++
-- reference implementations in this change).
CREATE OR REPLACE FUNCTION round_wallet_balance(
    raw_value NUMERIC,
    decimals  SMALLINT DEFAULT 6
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT ROUND(raw_value, decimals::int);
$$;

-- Trigger: recompute rounded_balance from raw_balance on every
-- insert/update, using the exact same function for every wallet.
CREATE OR REPLACE FUNCTION trg_round_wallet_balance() RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.rounded_balance := round_wallet_balance(NEW.raw_balance, NEW.decimals);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wallets_round_balance ON wallets;
CREATE TRIGGER wallets_round_balance
    BEFORE INSERT OR UPDATE OF raw_balance, decimals ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION trg_round_wallet_balance();

-- Example (same function call regardless of who the wallet belongs to):
-- UPDATE wallets SET raw_balance = 3.1415926535 WHERE wallet_id = 1;
-- -> rounded_balance becomes 3.141593 for ANY wallet_id, including the owner's.
