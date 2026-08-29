/**
 * PiRC - Section 4: Allocation Period - v2.0.0
 * Covers Design Option 1 (deposit-only, tiered discount) and
 * Design Option 2 (deposit + swap, continuous discount curve).
 */

'use strict';

// ─────────────────────────────────────────────
// 1. STATIC DATABASE
// ─────────────────────────────────────────────

const PIRC_ALLOCATION_DB = {
  document: {
    title: 'PiRC - Section 4: Allocation Period',
    version: '2.0.0',
    nextSection: '5-tge-state',
  },

  notation: {
    T:        { symbol: 'T',        name: 'Total Ecosystem Token Allocation', unit: 'tokens' },
    C:        { symbol: 'C',        name: 'Total Pi Committed',               unit: 'Pi' },
    p_list:   { symbol: 'p_list',   name: 'Listing Price',                    unit: 'Pi/token' },
    T_engage: { symbol: 'T_engage', name: 'Engagement Bonus Bucket (Design 1)', fraction: 0.05, unit: 'tokens' },
  },

  design1: {
    label: 'Design Option 1 - Deposit-Only Model',
    tokenBuckets: {
      purchase:  { fraction: 1.00, destination: 'Participants (base allocation)' },
      liquidity: { fraction: 1.00, destination: 'Liquidity Pool (LP)' },
      engage:    { fraction: 0.05, destination: 'Engagement bonus tiers' },
    },
    engagementTiers: [
      { tier: 'top',    rankRange: [0.0, 1 / 3], engageShare: 2 / 3, avgBonusPct: 10.0, pEffOverPList: 0.909 },
      { tier: 'middle', rankRange: [1 / 3, 2 / 3], engageShare: 1 / 3, avgBonusPct: 5.0, pEffOverPList: 0.952 },
      { tier: 'bottom', rankRange: [2 / 3, 1.0], engageShare: 0, avgBonusPct: 0.0, pEffOverPList: 1.000 },
    ],
  },

  design2: {
    label: 'Design Option 2 - Deposit + Swap Model',
    tokenSplit: {
      lpPortion:         { fraction: 0.8, destination: 'Liquidity Pool (LP)' },
      fixedPricePortion: { fraction: 0.2, destination: 'Sold at Listing Price to Pioneers' },
    },
    piSplit: {
      bucketA: { fraction: 0.5, purpose: 'Direct purchase of 20% of T at listing price' },
      bucketB: { fraction: 0.5, purpose: 'Engagement-ranked swaps from LP' },
    },
    effectivePriceData: [
      { sFraction: 0.0, pEffNorm: 0.400 }, { sFraction: 0.1, pEffNorm: 0.465 },
      { sFraction: 0.2, pEffNorm: 0.529 }, { sFraction: 0.3, pEffNorm: 0.594 },
      { sFraction: 0.4, pEffNorm: 0.658 }, { sFraction: 0.5, pEffNorm: 0.720 },
      { sFraction: 0.6, pEffNorm: 0.780 }, { sFraction: 0.7, pEffNorm: 0.839 },
      { sFraction: 0.8, pEffNorm: 0.895 }, { sFraction: 0.9, pEffNorm: 0.949 },
      { sFraction: 1.0, pEffNorm: 1.000 },
    ],
  },

  chains: {
    supported: ['Pi Network (Stellar/Soroban)', 'Solana', 'Ethereum'],
    defaultSettlement: 'Pi Network (Stellar/Soroban)',
  },
};

// ─────────────────────────────────────────────
// 2. DESIGN OPTION 1 CALCULATOR
// ─────────────────────────────────────────────

class PiRCAllocationCalculatorD1 {
  /**
   * @param {number} T - Total token launch allocation
   * @param {number} C - Total Pi committed by all participants
   */
  constructor(T, C) {
    if (!Number.isFinite(T) || !Number.isFinite(C) || T <= 0 || C <= 0) {
      throw new Error('T and C must be finite positive numbers.');
    }
    this.T = T;
    this.C = C;
    this.p_list = C / T;
    this.T_engage = 0.05 * T;
  }

  /** Which tier a participant falls into, given their engagement rank fraction (0 = most engaged) */
  tierFor(rankFraction) {
    if (rankFraction < 1 / 3) return 'top';
    if (rankFraction < 2 / 3) return 'middle';
    return 'bottom';
  }

  bonusPctFor(rankFraction) {
    const tier = this.tierFor(rankFraction);
    if (tier === 'top') return 10.0;
    if (tier === 'middle') return 5.0;
    return 0.0;
  }

  /**
   * @param {number} piCommitted
   * @param {number} rankFraction - 0 (most engaged) to 1 (least engaged)
   */
  participantSummary(piCommitted, rankFraction) {
    const tokensBase = piCommitted / this.p_list;
    const bonusPct = this.bonusPctFor(rankFraction);
    const tokensBonus = tokensBase * (bonusPct / 100);
    const tokensTotal = tokensBase + tokensBonus;
    const effectivePrice = piCommitted / tokensTotal;

    return {
      piCommitted,
      tier: this.tierFor(rankFraction),
      tokensBase,
      tokensBonus,
      tokensTotal,
      effectivePrice,
      discountPercent: ((this.p_list - effectivePrice) / this.p_list) * 100,
    };
  }

  poolSummary() {
    return {
      T: this.T,
      C: this.C,
      p_list: this.p_list,
      T_engage: this.T_engage,
      totalCirculatingSupply: 2.05 * this.T,
    };
  }
}

// ─────────────────────────────────────────────
// 3. DESIGN OPTION 2 CALCULATOR
// ─────────────────────────────────────────────

class PiRCAllocationCalculatorD2 {
  /**
   * @param {number} T - Total token launch allocation
   * @param {number} C - Total Pi committed by all participants
   */
  constructor(T, C) {
    if (!Number.isFinite(T) || !Number.isFinite(C) || T <= 0 || C <= 0) {
      throw new Error('T and C must be finite positive numbers.');
    }
    this.T = T;
    this.C = C;
    this.p_list = C / (0.4 * T);
    this.k = 0.4 * C * T;
    this.x0 = C / 2;
    this.y0 = 0.8 * T;
    this.p_init = this.p_list / 4;
  }

  xAtS(s) { return this.x0 + s; }
  yAtS(s) { return this.k / this.xAtS(s); }

  pSwap(s) {
    const x = this.xAtS(s);
    return (x * x) / this.k;
  }

  pSwapNorm(s) {
    return 0.25 * Math.pow(1 + (2 * s) / this.C, 2);
  }

  pEff(s) {
    const ps = this.pSwap(s);
    return (2 * this.p_list * ps) / (this.p_list + ps);
  }

  discountPercent(s) {
    return ((this.p_list - this.pEff(s)) / this.p_list) * 100;
  }

  participantSummary(piCommitted, s) {
    const halfPi = piCommitted / 2;
    const tokensA = halfPi / this.p_list;
    const tokensB = halfPi / this.pSwap(s);
    const totalTokens = tokensA + tokensB;
    const effectivePrice = piCommitted / totalTokens;

    return {
      piCommitted,
      s_cumulative: s,
      bucketA: { piUsed: halfPi, tokensReceived: tokensA, price: this.p_list },
      bucketB: { piUsed: halfPi, tokensReceived: tokensB, price: this.pSwap(s) },
      totalTokens,
      effectivePrice,
      discountPercent: this.discountPercent(s),
    };
  }

  effectivePriceCurve(n = 11) {
    const halfC = this.C / 2;
    return Array.from({ length: n }, (_, i) => {
      const s = (i / (n - 1)) * halfC;
      const pEff = this.pEff(s);
      return {
        s,
        sFraction: s / halfC,
        pSwap: this.pSwap(s),
        pSwapNorm: this.pSwapNorm(s),
        pEff,
        pEffNorm: pEff / this.p_list,
        discount: this.discountPercent(s),
      };
    });
  }

  poolSummary() {
    return {
      T: this.T,
      C: this.C,
      p_list: this.p_list,
      p_init: this.p_init,
      k: this.k,
      lpPiReserve: this.x0,
      lpTokenReserve: this.y0,
      minEffPrice: this.pEff(0),
      maxEffPrice: this.pEff(this.C / 2),
      maxDiscountPct: this.discountPercent(0),
      minDiscountPct: this.discountPercent(this.C / 2),
    };
  }
}

// ─────────────────────────────────────────────
// 4. DEMO
// ─────────────────────────────────────────────

function runDemo() {
  console.log('=== Design 1 Demo (Deposit-Only) ===');
  const d1 = new PiRCAllocationCalculatorD1(1_000_000, 250_000);
  console.table(d1.poolSummary());
  console.table([
    d1.participantSummary(5000, 0.05),
    d1.participantSummary(2000, 0.40),
    d1.participantSummary(1000, 0.85),
  ]);

  console.log('\n=== Design 2 Demo (Deposit + Swap) ===');
  const d2 = new PiRCAllocationCalculatorD2(1_000_000, 400_000);
  console.table(d2.poolSummary());
  console.table(d2.effectivePriceCurve());
  console.table([
    d2.participantSummary(1000, 0),
    d2.participantSummary(1000, 100_000),
    d2.participantSummary(1000, 200_000),
  ]);
}

if (require.main === module) {
  runDemo();
}

// ─────────────────────────────────────────────
// 5. EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  PIRC_ALLOCATION_DB,
  PiRCAllocationCalculatorD1,
  PiRCAllocationCalculatorD2,
};
