# 09 — Migration from current backend to smart contracts (pragmatic path)

Your repo’s current model (as documented in `docs/onchain-vs-db.md` and `docs/TOKEN_AND_LAUNCH.md`) uses:

- a **single custody account** to move value onchain,
- a **DB ledger** to track positions and launch state,
- and backend services to coordinate flows.

PiRC smart contracts can be introduced incrementally without stopping development.

---

## Step 0: keep the UI + DB, add “event-first” thinking

Even before deploying contracts, structure the system as if onchain events were the ledger:

- every money-moving action emits an auditable artifact (tx hash),
- DB stores pointers and computed summaries,
- reconciliation jobs validate DB vs chain.

This reduces migration risk later.

---

## Step 1: escrow commitments onchain (PiRC’s core)

Replace “custody wallet receives commitments” with:

- **Escrow contract receives commitments** during participation,
- escrow emits `Committed(user, amount)` events,
- backend becomes an indexer + UI server (not a custodian for commitment funds).

This step alone strongly enforces:

- “committed Pi is liquidity, not revenue.”

---

## Step 2: seed liquidity + lock initial LP position

Implement the onchain steps:

- `seedLiquidity(C, T_liquidity)` into the DEX pool,
- lock the resulting LP position in a `LiquidityLock` contract.

At this point, PiRC’s “anti-rug liquidity” promise becomes code.

---

## Step 3: token distribution + optional engagement bonuses

Start simple:

- base allocation is pro-rata: \(t_i^{base}=c_i\cdot\frac{T}{C}\)

Then add engagement:

- compute tiers offchain,
- publish merkle root onchain,
- users prove bonus in `claim()`.

This keeps contracts small while still making the outcome verifiable.

---

## Step 4: move remaining product flows (savings/lending) as needed

Your docs already emphasize moving “leftovers” fully onchain (e.g., savings withdrawals) and segmenting funds.

Smart contracts can help, but you can also keep:

- “positions and timestamps” in DB,
- and only move “custody and enforcement” onchain.

For savings and lending, a typical long-term endpoint is:

- contract-based vaults (savings) and lending pools,
- explicit reserves/buffers,
- onchain liquidation logic.

---

## Step 5: split wallets / namespacing (optional later)

Today you use one custody key and logical segmentation in DB.

Later, you can upgrade to:

- separate contracts/wallets per product,
- explicit treasury allocations,
- clearer accounting and risk isolation.

Even with multiple wallets/contracts, the **PiRC invariant stays the same**:

- commitment funds do not become project proceeds.

