/**
 * PiRC – Section 4: Allocation Period (Design Option 2)
 * Source: https://github.com/PiRC/blob/Tsukimarf-patch-1/
 *         PiRC1/4-allocation/4-allocation%20design%202.md
 *
 * LP formation using both deposit and swap operations.
 */

// ─────────────────────────────────────────────
// 1. STATIC DATABASE (mirrors JSON file)
// ─────────────────────────────────────────────

const PIRC_ALLOCATION_DB = {
  document: {
    title: "PiRC – Section 4: Allocation Period (Design Option 2)",
    designOption: 2,
    description: "LP formation using both deposit and swap operations",
    nextSection: "5-tge-state design 2.md",
  },

  notation: {
    T: { symbol: "T", name: "Total Ecosystem Token Allocation", unit: "tokens" },
    C: { symbol: "C", name: "Total Pi Committed", unit: "Pi" },
    p_list: { symbol: "p_list", name: "Listing Price", formula: "C / (0.4 * T)", unit: "Pi/token" },
  },

  tokenSplit: {
    lpPortion:         { percent: 80, fraction: 0.8, destination: "Liquidity Pool (LP)" },
    fixedPricePortion: { percent: 20, fraction: 0.2, destination: "Sold at Listing Price to Pioneers" },
  },

  piSplit: {
    bucketA: {
      label: "Bucket A – Fixed Price (Step 1)",
      fraction: 0.5,
      purpose: "Direct purchase of 20% of T at listing price",
    },
    bucketB: {
      label: "Bucket B – Engagement Swaps (Step 3)",
      fraction: 0.5,
      purpose: "Engagement-ranked swaps from LP",
    },
  },

  steps: [
    {
      step: 1,
      name: "Fixed-Price Delivery",
      piUsed: "C / 2",
      tokensDelivered: "0.2 * T",
      listingPrice: "C / (0.4 * T)",
      deliveryType: "Direct sale to participants",
    },
    {
      step: 2,
      name: "Escrow Deposit and Pool Creation",
      piDeposited: "C / 2",
      tokensDeposited: "0.8 * T",
      poolParameters: {
        initialSpotPrice: "p_list / 4",
        constantProductInvariant: "k = 0.4 * C * T",
      },
      escrowLockup: {
        action: "Signing authority removed to 0",
        irreversible: true,
      },
    },
    {
      step: 3,
      name: "Automated Engagement-Based Swaps",
      rankingBasis: "Engagement Score (Participation Window)",
      order: "Highest-to-lowest engagement",
      automated: true,
      swapPriceRange: { first: "p_list / 4", last: "p_list" },
      discountRange:  { maxPercent: 60, minPercent: 0 },
      lockupPolicy:   "Higher discount → longer post-TGE lockup",
      lpFeePercent:   0.3,
    },
  ],

  effectivePriceData: [
    { sFraction: 0.0, pEffNorm: 0.400 },
    { sFraction: 0.1, pEffNorm: 0.465 },
    { sFraction: 0.2, pEffNorm: 0.529 },
    { sFraction: 0.3, pEffNorm: 0.594 },
    { sFraction: 0.4, pEffNorm: 0.658 },
    { sFraction: 0.5, pEffNorm: 0.720 },
    { sFraction: 0.6, pEffNorm: 0.780 },
    { sFraction: 0.7, pEffNorm: 0.839 },
    { sFraction: 0.8, pEffNorm: 0.895 },
    { sFraction: 0.9, pEffNorm: 0.949 },
    { sFraction: 1.0, pEffNorm: 1.000 },
  ],
};

// ─────────────────────────────────────────────
// 2. FORMULA ENGINE
// ─────────────────────────────────────────────

class PiRCAllocationCalculator {
  /**
   * @param {number} T - Total token launch allocation
   * @param {number} C - Total Pi committed by all participants
   */
  constructor(T, C) {
    if (!Number.isFinite(T) || !Number.isFinite(C) || T <= 0 || C <= 0) {
      throw new Error("T and C must be finite positive numbers.");
    }
    this.T = T;
    this.C = C;

    // Core derived values
    this.p_list = C / (0.4 * T);           // Listing price (Pi/token)
    this.k      = 0.4 * C * T;             // AMM constant-product invariant
    this.x0     = C / 2;                   // Initial LP Pi reserve
    this.y0     = 0.8 * T;                 // Initial LP token reserve
    this.p_init = this.p_list / 4;         // Initial LP spot price
  }

  /** LP Pi reserve after cumulative swap s */
  xAtS(s) { return this.x0 + s; }

  /** LP token reserve after cumulative swap s */
  yAtS(s) { return this.k / this.xAtS(s); }

  /** Marginal swap spot price at cumulative swap s */
  pSwap(s) {
    const x = this.xAtS(s);
    return (x * x) / this.k;
  }

  /** Normalized p_swap / p_list — formula: (1/4)(1 + 2s/C)^2 */
  pSwapNorm(s) {
    return 0.25 * Math.pow(1 + (2 * s) / this.C, 2);
  }

  /**
   * Effective acquisition price for a participant who swaps at cumulative level s.
   * Harmonic mean of p_list (Bucket A) and p_swap(s) (Bucket B).
   */
  pEff(s) {
    const ps = this.pSwap(s);
    return (2 * this.p_list * ps) / (this.p_list + ps);
  }

  /** Discount percentage relative to listing price */
  discountPercent(s) {
    return ((this.p_list - this.pEff(s)) / this.p_list) * 100;
  }

  /**
   * Full allocation summary for a participant.
   * @param {number} piCommitted - Pi committed by this participant
   * @param {number} s           - Cumulative Pi swapped into LP at this participant's rank
   * @returns {object}
   */
  participantSummary(piCommitted, s) {
    const halfPi        = piCommitted / 2;

    // Bucket A: fixed-price tokens
    const tokensA       = halfPi / this.p_list;

    // Bucket B: LP swap tokens (estimated from marginal price at s)
    const tokensB       = halfPi / this.pSwap(s);

    const totalTokens   = tokensA + tokensB;
    const effectivePrice = piCommitted / totalTokens;
    const discount       = this.discountPercent(s);

    return {
      piCommitted,
      s_cumulative:   s,
      bucketA: { piUsed: halfPi, tokensReceived: tokensA, price: this.p_list },
      bucketB: { piUsed: halfPi, tokensReceived: tokensB, price: this.pSwap(s) },
      totalTokens,
      effectivePrice,
      discountPercent: discount,
      note: "Bucket B tokens subject to post-TGE lockup proportional to discount.",
    };
  }

  /**
   * Generate the full effective-price curve over n evenly-spaced points.
   * @param {number} n - Number of data points (default 11)
   */
  effectivePriceCurve(n = 11) {
    const halfC = this.C / 2;
    return Array.from({ length: n }, (_, i) => {
      const s = (i / (n - 1)) * halfC;
      const pEff = this.pEff(s);
      return {
        s,
        sFraction:    s / halfC,
        pSwap:        this.pSwap(s),
        pSwapNorm:    this.pSwapNorm(s),
        pEff:         pEff,
        pEffNorm:     pEff / this.p_list,
        discount:     this.discountPercent(s),
      };
    });
  }

  /** Human-readable summary of pool configuration */
  poolSummary() {
    return {
      T:              this.T,
      C:              this.C,
      p_list:         this.p_list,
      p_init:         this.p_init,
      k:              this.k,
      lpPiReserve:    this.x0,
      lpTokenReserve: this.y0,
      minEffPrice:    this.pEff(0),          // most engaged
      maxEffPrice:    this.pEff(this.C / 2), // least engaged
      maxDiscountPct: this.discountPercent(0),
      minDiscountPct: this.discountPercent(this.C / 2),
    };
  }
}

// ─────────────────────────────────────────────
// 3. DEMO / USAGE EXAMPLE
// ─────────────────────────────────────────────

function runDemo() {
  // Example: 1,000,000 tokens launched, 400,000 Pi committed
  const calc = new PiRCAllocationCalculator(1_000_000, 400_000);

  console.log("=== Pool Summary ===");
  console.table(calc.poolSummary());

  console.log("\n=== Effective Price Curve ===");
  console.table(calc.effectivePriceCurve());

  console.log("\n=== Participant Example (most engaged, pi=1000) ===");
  console.table(calc.participantSummary(1000, 0));

  console.log("\n=== Participant Example (least engaged, pi=1000) ===");
  console.table(calc.participantSummary(1000, 200_000)); // s = C/2

  console.log("\n=== Static DB (first step) ===");
  console.log(JSON.stringify(PIRC_ALLOCATION_DB.steps[0], null, 2));
}

runDemo();

// ─────────────────────────────────────────────
// 4. EXPORTS (Node / ES module compatible)
// ─────────────────────────────────────────────

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PIRC_ALLOCATION_DB, PiRCAllocationCalculator };
}