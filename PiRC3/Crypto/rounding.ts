export type RoundingMode = "floor" | "ceil" | "nearest";

export function roundInteger(
  value: bigint,
  step: bigint,
  mode: RoundingMode = "nearest",
): bigint {
  if (step <= 0n) {
    throw new Error("Step mesti lebih besar daripada sifar.");
  }

  // Pembahagian BigInt membundarkan ke arah sifar.
  const quotient = value / step;
  const remainder = value % step;

  if (remainder === 0n) {
    return value;
  }

  if (mode === "floor") {
    return value < 0n
      ? (quotient - 1n) * step
      : quotient * step;
  }

  if (mode === "ceil") {
    return value > 0n
      ? (quotient + 1n) * step
      : quotient * step;
  }

  if (mode === "nearest") {
    const absRemainder =
      remainder < 0n ? -remainder : remainder;

    if (absRemainder * 2n < step) {
      return quotient * step;
    }

    // Nilai tepat di tengah dibundarkan menjauhi sifar.
    const direction = value > 0n ? 1n : -1n;
    return (quotient + direction) * step;
  }

  throw new Error("Kaedah pembulatan tidak sah.");
}
