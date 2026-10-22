export interface BalanceRecord {
  accountId: string;
  balance: bigint;
  updatedAt: string;
}

export interface BalanceRepository {
  get(accountId: string): Promise<BalanceRecord | null>;
  save(record: BalanceRecord): Promise<void>;
}

export class MemoryBalanceRepository
  implements BalanceRepository {
  private readonly records = new Map<string, BalanceRecord>();

  async get(accountId: string): Promise<BalanceRecord | null> {
    const record = this.records.get(accountId);

    return record ? { ...record } : null;
  }

  async save(record: BalanceRecord): Promise<void> {
    this.records.set(record.accountId, { ...record });
  }
}
