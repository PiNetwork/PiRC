"use strict";

/**
 * Uniform wallet balance rounding (Node.js / CommonJS).
 *
 * One rule, applied identically to every wallet (owner, miner, or
 * otherwise). There is no account-type, role, or "owner" branch
 * anywhere in this module. Arithmetic uses BigInt throughout to
 * avoid floating-point precision drift.
 */

const AMOUNT_PATTERN = /^(0|[1-9]\d*)(\.\d+)?$/;

const RoundingMode = Object.freeze({
  FLOOR: "floor",
  CEIL: "ceil",
  NEAREST: "nearest",
});

function parseUnits(amount, decimals) {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 100) {
    throw new Error("Bilangan perpuluhan tidak sah.");
  }
  if (!AMOUNT_PATTERN.test(amount)) {
    throw new Error("Format jumlah tidak sah.");
  }

  const [whole, fraction = ""] = amount.split(".");
  if (fraction.length > decimals) {
    throw new Error("Jumlah mempunyai terlalu banyak perpuluhan.");
  }
  const paddedFraction = fraction.padEnd(decimals, "0");

  const scale = 10n ** BigInt(decimals);
  return BigInt(whole) * scale + BigInt(paddedFraction || "0");
}

function formatUnits(value, decimals) {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 100) {
    throw new Error("Bilangan perpuluhan tidak sah.");
  }
  if (value < 0n) {
    throw new Error("Baki tidak boleh negatif.");
  }
  if (decimals === 0) {
    return value.toString();
  }

  const scale = 10n ** BigInt(decimals);
  const whole = value / scale;
  const fraction = (value % scale)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function roundInteger(value, step, mode = RoundingMode.NEAREST) {
  if (step <= 0n) {
    throw new Error("Step mesti lebih besar daripada sifar.");
  }

  const quotient = value / step;
  const remainder = value % step;

  if (remainder === 0n) {
    return value;
  }

  if (mode === RoundingMode.FLOOR) {
    return value < 0n ? (quotient - 1n) * step : quotient * step;
  }

  if (mode === RoundingMode.CEIL) {
    return value > 0n ? (quotient + 1n) * step : quotient * step;
  }

  if (mode === RoundingMode.NEAREST) {
    const absRemainder = remainder < 0n ? -remainder : remainder;
    if (absRemainder * 2n < step) {
      return quotient * step;
    }
    const direction = value > 0n ? 1n : -1n;
    return (quotient + direction) * step;
  }

  throw new Error("Kaedah pembulatan tidak sah.");
}

/**
 * Round a decimal-string wallet amount to `decimals` places using
 * round-half-up (away from zero). This is the single entry point
 * every caller should use; it takes no account type, role, or
 * owner flag, and behaves identically for every wallet by design.
 */
function roundWalletBalance(rawAmount, decimals = 6) {
  const [, fraction = ""] = rawAmount.split(".");
  const rawDecimals = fraction.length;

  if (rawDecimals <= decimals) {
    const units = parseUnits(rawAmount, decimals);
    return formatUnits(units, decimals);
  }

  const units = parseUnits(rawAmount, rawDecimals);
  const step = 10n ** BigInt(rawDecimals - decimals);
  const rounded = roundInteger(units, step, RoundingMode.NEAREST);
  const finalUnits = rounded / step;
  return formatUnits(finalUnits, decimals);
}

module.exports = {
  RoundingMode,
  parseUnits,
  formatUnits,
  roundInteger,
  roundWalletBalance,
};
