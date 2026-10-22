/**
 * PiRC3 Allocation Engine
 *
 * Reads a configuration object that conforms to pirc3-allocation-schema.json
 * and computes derived values: pool parameters, participant allocations,
 * discounts, and an effective price curve.
 *
 * This is a design-stage implementation: plug in real validated data before
 * using it to drive any real transfer of value.
 */

'use strict';

/**
 * Minimal structural validation. For production use, validate the config
 * against pirc3-allocation-schema.json with a proper JSON Schema validator
 * (e.g. ajv) instead of this hand-rolled check.
 */
function validateConfig(config) {
  const errors = [];
  const required = ['schemaVersion', 'allocationId', 'totalSupply', 'tokenSplits', 'piSplits', 'poolParameters', 'participantTiers'];
  for (const key of required) {
    if (!(key in config)) errors.push(`Missing required field: ${key}`);
  }
  if (config.tokenSplits) {
    const sum = config.tokenSplits.reduce((acc, s) => acc + (s.percentage || 0), 0);
    if (Math.abs(sum - 100) > 0.01) errors.push(`tokenSplits percentages sum to ${sum}, expected 100`);
  }
  if (config.piSplits) {
    const sum = config.piSplits.reduce((acc, s) => acc + (s.percentage || 0), 0);
    if (Math.abs(sum - 100) > 0.01) errors.push(`piSplits percentages sum to ${sum}, expected 100`);
  }
  if (errors.length) {
    throw new Error(`PiRC3 allocation config invalid:\n- ${errors.join('\n- ')}`);
  }
}

class PiRCAllocationEngine {
  constructor(config) {
    validateConfig(config);
    this.config = config;
  }

  /** Token amount allocated to a given tokenSplits category. */
  getTokenAmountForCategory(categoryName) {
    const split = this.config.tokenSplits.find((s) => s.category === categoryName);
    if (!split) throw new Error(`Unknown token split category: ${categoryName}`);
    return (split.percentage / 100) * this.config.totalSupply;
  }

  /**
   * AMM pool parameters derived from poolParameters and totalSupply.
   * Assumes a constant-product pool: x * y = k, where x = tokens in pool,
   * y = reserve-asset value in pool, priced at listingPrice.
   */
  computePoolParameters() {
    const { listingPrice, reserveRatio, swapFeeBps } = this.config.poolParameters;
    const liquiditySplit = this.config.piSplits.find((s) => s.category.toLowerCase().includes('liquidity'));
    if (!liquiditySplit) {
      throw new Error('No piSplits category containing "liquidity" found — cannot size the pool');
    }
    const poolTokens = this.config.totalSupply * (reserveRatio);
    const poolReserveValue = poolTokens * listingPrice;
    const k = poolTokens * poolReserveValue;
    return {
      listingPrice,
      poolTokens,
      poolReserveValue,
      constantProductK: k,
      swapFeeBps,
    };
  }

  /**
   * Effective price curve: how the price moves as reserve-asset is swapped
   * into the pool for tokens, sampled at `steps` points.
   */
  computeEffectivePriceCurve(steps = 10) {
    const { poolTokens, poolReserveValue, constantProductK } = this.computePoolParameters();
    const curve = [];
    for (let i = 0; i <= steps; i++) {
      const fractionIn = i / steps;
      const reserveIn = poolReserveValue * fractionIn;
      const newReserve = poolReserveValue + reserveIn;
      const newTokens = constantProductK / newReserve;
      const tokensOut = poolTokens - newTokens;
      const effectivePrice = reserveIn > 0 ? reserveIn / tokensOut : this.config.poolParameters.listingPrice;
      curve.push({ fractionIn, reserveIn, tokensOut, effectivePrice });
    }
    return curve;
  }

  /** Find the participant tier for a given engagement/contribution score. */
  getTierForScore(score) {
    const tiers = [...this.config.participantTiers].sort((a, b) => b.minScore - a.minScore);
    const tier = tiers.find((t) => score >= t.minScore);
    if (!tier) throw new Error(`No tier matches score ${score}`);
    return tier;
  }

  /**
   * Compute one participant's allocation: discount applied to listing price,
   * capped by the tier's allocationCap if present.
   */
  computeParticipantAllocation(participant) {
    const { score, contributionAmount } = participant;
    const tier = this.getTierForScore(score);
    const { listingPrice } = this.config.poolParameters;
    const effectivePrice = listingPrice * (1 - tier.discountPercent / 100);
    let tokenAmount = contributionAmount / effectivePrice;
    if (tier.allocationCap != null) {
      tokenAmount = Math.min(tokenAmount, tier.allocationCap);
    }
    return {
      tier: tier.tierName,
      discountPercent: tier.discountPercent,
      effectivePrice,
      tokenAmount,
    };
  }

  /** Summary of the full configuration for reporting/demo purposes. */
  summarize() {
    return {
      allocationId: this.config.allocationId,
      totalSupply: this.config.totalSupply,
      tokenSplits: this.config.tokenSplits,
      piSplits: this.config.piSplits,
      poolParameters: this.computePoolParameters(),
      tiers: this.config.participantTiers,
    };
  }
}

module.exports = { PiRCAllocationEngine, validateConfig };

// --- Demo (only runs if executed directly, e.g. `node pirc3-allocation-engine.js`) ---
if (require.main === module) {
  const demoConfig = {
    schemaVersion: '1.0.0',
    allocationId: 'PiRC3-demo-001',
    totalSupply: 1000000,
    tokenSplits: [
      { category: 'community', percentage: 60 },
      { category: 'team', percentage: 20, lockupMonths: 12, vestingMonths: 24 },
      { category: 'treasury', percentage: 20 },
    ],
    piSplits: [
      { category: 'liquidity_pool', percentage: 70 },
      { category: 'reserve', percentage: 30 },
    ],
    poolParameters: { listingPrice: 0.1, reserveRatio: 0.5, swapFeeBps: 30 },
    participantTiers: [
      { tierName: 'bronze', minScore: 0, discountPercent: 0 },
      { tierName: 'silver', minScore: 50, discountPercent: 5, allocationCap: 5000 },
      { tierName: 'gold', minScore: 100, discountPercent: 10, allocationCap: 20000 },
    ],
  };

  const engine = new PiRCAllocationEngine(demoConfig);
  console.log('Pool parameters:', engine.computePoolParameters());
  console.log('Participant (score 75, contributes 500):', engine.computeParticipantAllocation({ score: 75, contributionAmount: 500 }));
  console.log('Price curve sample:', engine.computeEffectivePriceCurve(4));
}
