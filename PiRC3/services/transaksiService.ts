import {
  formatUnits,
  parseUnits,
} from "../crypto/units";

import {
  roundInteger,
  RoundingMode,
} from "../crypto/rounding";

import {
  BalanceRepository,
} from "../database/repository";

export class TransactionService {
  constructor(
    private readonly repository: BalanceRepository,
  ) {}

  async calculateRoundedBalance(input: {
    accountId: string;
    amount: string;
    decimals: number;
    step: string;
    mode: RoundingMode;
  }) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(input.accountId)) {
      throw new Error("ID akaun tidak sah.");
    }

    const amount = parseUnits(input.amount, input.decimals);
    const step = BigInt(input.step);

    const rounded = roundInteger(amount, step, input.mode);

    await this.repository.save({
      accountId: input.accountId,
      balance: rounded,
      updatedAt: new Date().toISOString(),
    });

    return {
      accountId: input.accountId,
      originalAmount: input.amount,
      roundedAmount: formatUnits(rounded, input.decimals),
      decimals: input.decimals,
      roundingMode: input.mode,
      status: "calculated",
    };
  }
}
