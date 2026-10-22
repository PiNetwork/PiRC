/**
 * Uniform wallet balance rounding (TypeScript).
 *
 * Composes the existing `Crypto/rounding.ts` (roundInteger) and
 * `Crypto/units.ts` (parseUnits / formatUnits) into one entry point.
 * There is no account-type, role, or "owner" branch anywhere here —
 * every wallet goes through the exact same function.
 *
 * Drop this file alongside Crypto/rounding.ts and Crypto/units.ts
 * (adjust the relative import paths below to match where it lands).
 */

import { roundInteger, RoundingMode } from "../Crypto/rounding";
import { parseUnits, formatUnits } from "../Crypto/units";

/**
 * Round a decimal-string wallet amount to `decimals` places using
 * round-half-up (away from zero).
 */
export function roundWalletBalance(
  rawAmount: string,
  decimals: number = 6,
): string {
  const [, fraction = ""] = rawAmount.split(".");
  const rawDecimals = fraction.length;

  if (rawDecimals <= decimals) {
    const units = parseUnits(rawAmount, decimals);
    return formatUnits(units, decimals);
  }

  const units = parseUnits(rawAmount, rawDecimals);
  const step = 10n ** BigInt(rawDecimals - decimals);
  const rounded = roundInteger(units, step, "nearest" as RoundingMode);
  const finalUnits = rounded / step;
  return formatUnits(finalUnits, decimals);
}
