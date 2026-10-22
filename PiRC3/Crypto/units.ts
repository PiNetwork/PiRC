export function parseUnits(
  amount: string,
  decimals: number,
): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 100) {
    throw new Error("Bilangan perpuluhan tidak sah.");
  }

  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(amount)) {
    throw new Error("Format jumlah tidak sah.");
  }

  const [whole, fraction = ""] = amount.split(".");

  if (fraction.length > decimals) {
    throw new Error("Jumlah mempunyai terlalu banyak perpuluhan.");
  }

  const scale = 10n ** BigInt(decimals);
  const paddedFraction = fraction.padEnd(decimals, "0");

  return BigInt(whole) * scale +
    BigInt(paddedFraction || "0");
}

export function formatUnits(
  value: bigint,
  decimals: number,
): string {
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
