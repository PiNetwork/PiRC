# Wallet Balance Rounding Spec (PiRC3)

## Rule

One rule, applied identically to every wallet (owner, miner, or otherwise):

> Round the raw mined/stored amount to **6 decimal places** using
> **round-half-up, away from zero**, done in integer arithmetic
> (never floating point) to avoid precision drift.

- Default precision: `decimals = 6` (i.e. smallest unit = 0.000001 PI,
  matching the `parseUnits` / `formatUnits` convention already in
  `Crypto/units.ts`).
- The precision is a configurable parameter, not a hardcoded constant,
  so it can be tuned per deployment — but whatever value is chosen,
  it is the **same value for every account**. There is no
  account-type, role, or "owner" branch anywhere in this logic.
- All implementations operate on arbitrary-precision integers
  (Go `big.Int`, C++ string-based bigint, Python `Decimal`,
  JS/TS `BigInt`, SQL `NUMERIC`/`DECIMAL`) so a wallet with a large
  balance or many decimal places never silently loses precision to
  float rounding.

## Shared algorithm

1. Represent the raw amount as an integer number of "micro-units"
   (`raw_units = round(raw_decimal_amount * 10^decimals)` done via
   string/bigint parsing, never `parseFloat`/`float`).
2. To round to a coarser unit `step` (also in micro-units):
   - `quotient = raw_units / step`, `remainder = raw_units % step`
   - if `2 * |remainder| < step` → round down (`quotient * step`)
   - if `2 * |remainder| > step` → round up/away from zero
   - if `2 * |remainder| == step` (exact half) → round away from zero
3. Convert back to a decimal string for display/storage.

This is the same floor/ceil/nearest logic already in `Crypto/rounding.ts`,
generalized into one reusable "round wallet balance" entry point and
mirrored, with identical semantics, in every language/runtime below.

## Explicitly out of scope

- No per-account/"owner" exception path.
- No conversion formula that maps an arbitrary raw figure to "1 coin"
  without a verifiable, inspectable derivation. If a real formula
  (with real input variables) is supplied later, it should be
  reviewed and added as its own documented module — it should not be
  folded into this precision-rounding utility.
