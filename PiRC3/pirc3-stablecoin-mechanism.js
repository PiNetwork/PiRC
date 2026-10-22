/**
 * PiRC3 Stablecoin Mechanism
 *
 * Design-stage implementation of the mechanism described in
 * PiRC3-stablecoin-mechanism.md: reserve intake, minting, redemption,
 * and peg monitoring, backed by an auditable transaction log.
 *
 * All financial/legal parameters (collateralizationRatio, pegTarget, fees,
 * redemption rules) are placeholders — set them deliberately, and have the
 * real configuration reviewed before this touches real funds.
 */

'use strict';

class ReserveLedger {
  constructor() {
    this.deposits = []; // { id, asset, amount, custodyLocation, timestamp }
  }

  addDeposit({ asset, amount, custodyLocation }) {
    if (amount <= 0) throw new Error('Deposit amount must be positive');
    const entry = {
      id: `dep_${this.deposits.length + 1}`,
      asset,
      amount,
      custodyLocation,
      timestamp: new Date().toISOString(),
    };
    this.deposits.push(entry);
    return entry;
  }

  /** Total reserve value. Assumes all deposits are in a single valuation unit for simplicity. */
  getTotalReserveValue() {
    return this.deposits.reduce((sum, d) => sum + d.amount, 0);
  }

  listDeposits() {
    return [...this.deposits];
  }
}

class StablecoinMechanism {
  /**
   * @param {object} params
   * @param {string} params.pegTarget - what 1 unit tracks, e.g. "1 USD"
   * @param {number} params.minCollateralizationRatio - e.g. 1.2 for 120%
   * @param {number} params.pegDeviationThresholdPct - e.g. 2 for +/-2%
   * @param {ReserveLedger} [params.reserveLedger]
   */
  constructor({ pegTarget, minCollateralizationRatio, pegDeviationThresholdPct, reserveLedger }) {
    if (!pegTarget) throw new Error('pegTarget is required');
    if (!(minCollateralizationRatio > 1)) {
      throw new Error('minCollateralizationRatio must be > 1 (e.g. 1.2 for 120%)');
    }
    this.pegTarget = pegTarget;
    this.minCollateralizationRatio = minCollateralizationRatio;
    this.pegDeviationThresholdPct = pegDeviationThresholdPct ?? 2;
    this.reserveLedger = reserveLedger || new ReserveLedger();

    this.circulatingSupply = 0;
    this.transactionLog = []; // { type, amount, counterparty, timestamp, reserveSnapshot }
    this.pegHistory = []; // { timestamp, observedPrice, targetPrice, deviationPct }
  }

  /** Current collateralization ratio: reserve value / circulating supply. */
  collateralizationRatio() {
    if (this.circulatingSupply === 0) return Infinity;
    return this.reserveLedger.getTotalReserveValue() / this.circulatingSupply;
  }

  /**
   * Mint new stablecoin units against a verified reserve deposit.
   * Refuses to mint if doing so would breach minCollateralizationRatio.
   */
  mint({ amount, counterparty, approvedBy }) {
    if (amount <= 0) throw new Error('Mint amount must be positive');
    const projectedSupply = this.circulatingSupply + amount;
    const projectedRatio = this.reserveLedger.getTotalReserveValue() / projectedSupply;
    if (projectedRatio < this.minCollateralizationRatio) {
      throw new Error(
        `Mint of ${amount} would drop collateralization to ${projectedRatio.toFixed(4)}, ` +
        `below the minimum of ${this.minCollateralizationRatio}`
      );
    }
    this.circulatingSupply = projectedSupply;
    const entry = this._logTransaction({ type: 'mint', amount, counterparty, approvedBy });
    return entry;
  }

  /**
   * Redeem stablecoin units for a proportional share of reserve.
   * Returns the reserve amount owed to the redeemer (before any fee).
   */
  redeem({ amount, counterparty, approvedBy, feePercent = 0 }) {
    if (amount <= 0) throw new Error('Redeem amount must be positive');
    if (amount > this.circulatingSupply) throw new Error('Cannot redeem more than circulating supply');

    const reserveShare = (amount / this.circulatingSupply) * this.reserveLedger.getTotalReserveValue();
    const fee = reserveShare * (feePercent / 100);
    const payout = reserveShare - fee;

    this.circulatingSupply -= amount;
    const entry = this._logTransaction({ type: 'redeem', amount, counterparty, approvedBy, reserveShare, fee, payout });
    return { reserveShare, fee, payout, entry };
  }

  /** Record an observed market price and flag whether it breaches the peg deviation threshold. */
  checkPeg(observedPrice, targetPrice = 1) {
    const deviationPct = ((observedPrice - targetPrice) / targetPrice) * 100;
    const breached = Math.abs(deviationPct) > this.pegDeviationThresholdPct;
    const record = { timestamp: new Date().toISOString(), observedPrice, targetPrice, deviationPct, breached };
    this.pegHistory.push(record);
    return record;
  }

  _logTransaction(data) {
    const entry = {
      ...data,
      timestamp: new Date().toISOString(),
      reserveSnapshot: this.reserveLedger.getTotalReserveValue(),
      circulatingSupplySnapshot: this.circulatingSupply,
    };
    this.transactionLog.push(entry);
    return entry;
  }

  getAuditTrail() {
    return {
      pegTarget: this.pegTarget,
      minCollateralizationRatio: this.minCollateralizationRatio,
      currentCollateralizationRatio: this.collateralizationRatio(),
      circulatingSupply: this.circulatingSupply,
      totalReserveValue: this.reserveLedger.getTotalReserveValue(),
      transactionLog: [...this.transactionLog],
      pegHistory: [...this.pegHistory],
    };
  }
}

module.exports = { ReserveLedger, StablecoinMechanism };

// --- Demo (only runs if executed directly) ---
if (require.main === module) {
  const ledger = new ReserveLedger();
  ledger.addDeposit({ asset: 'USD', amount: 120000, custodyLocation: 'placeholder-custodian' });

  const stablecoin = new StablecoinMechanism({
    pegTarget: '1 USD',
    minCollateralizationRatio: 1.2,
    pegDeviationThresholdPct: 2,
    reserveLedger: ledger,
  });

  console.log('Mint 100000:', stablecoin.mint({ amount: 100000, counterparty: 'issuer', approvedBy: 'demo-admin' }));
  console.log('Collateralization ratio:', stablecoin.collateralizationRatio());
  console.log('Peg check at 1.03:', stablecoin.checkPeg(1.03));
  console.log('Redeem 10000:', stablecoin.redeem({ amount: 10000, counterparty: 'holder-1', approvedBy: 'demo-admin', feePercent: 0.5 }));
  console.log('Audit trail:', JSON.stringify(stablecoin.getAuditTrail(), null, 2));
}
