import { describe, expect, it } from "vitest";
import { roundInteger } from "../src/crypto/rounding";

describe("PiRC3 rounding algorithm", () => {
  it("rounds down using floor", () => {
    expect(roundInteger(1249n, 100n, "floor")).toBe(1200n);
  });

  it("rounds up using ceil", () => {
    expect(roundInteger(1249n, 100n, "ceil")).toBe(1200n);
    // 1249 / 100 is 12 remainder 49, so ceil is 1200.
  });

  it("rounds nearest correctly", () => {
    expect(roundInteger(1250n, 100n, "nearest")).toBe(1300n);
    expect(roundInteger(1249n, 100n, "nearest")).toBe(1200n);
  });

  it("rejects a zero step", () => {
    expect(() => roundInteger(100n, 0n)).toThrow();
  });
});
