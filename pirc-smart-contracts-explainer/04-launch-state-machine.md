# 04 — Launch state machine (PiRC phases as contract states)

PiRC launches are easiest to implement correctly when the contract exposes a **state machine** and every money-moving function checks it.

---

## 1) States

A practical PiRC state machine:

- `DRAFT`
- `PARTICIPATION_OPEN`
- `PARTICIPATION_CLOSED`
- `ALLOCATION_FINALIZED`
- `LIQUIDITY_SEEDED`
- `TGE_OPEN`
- `CANCELLED` (optional)

---

## 2) Transitions and allowed actions

| State | Who can act | Allowed actions |
|------|-------------|-----------------|
| `DRAFT` | project owner / platform | set params, deposit token buckets (optional) |
| `PARTICIPATION_OPEN` | participants | `commit(c_i)` |
| `PARTICIPATION_CLOSED` | platform / anyone (if trustless) | freeze totals; forbid new commits |
| `ALLOCATION_FINALIZED` | platform or contract | finalize allocation inputs (e.g. tier roots) |
| `LIQUIDITY_SEEDED` | escrow | add liquidity, lock LP position |
| `TGE_OPEN` | anyone | swaps are now unrestricted; claims continue |

Key rule: **phase checks must be strict** and **one-way** for “final” steps.

---

## 3) Time windows (timestamps)

Contracts should store explicit timestamps:

- `participationStart`
- `participationEnd`
- optional: `tgeTime`

Then enforce:

- `commit()` requires `block.timestamp ∈ [start, end]`
- `seedLiquidity()` requires `block.timestamp > end`

This matches PiRC’s “window closes then allocation happens” model.

---

## 4) Cancellation and refunds (carefully)

If you support cancellation:

- cancellation should only be possible **before** liquidity seeding;
- refund commitments **from escrow back to users**;
- do **not** allow the project to receive commitment funds in the cancel path.

---

## 5) Events (audit trail)

Your indexer/DB should treat onchain events as the source of truth:

- `LaunchCreated(launchId, project, token, paramsHash)`
- `ParticipationOpened(launchId, start, end)`
- `Committed(launchId, user, amount)`
- `ParticipationClosed(launchId, totalCommitted)`
- `AllocationFinalized(launchId, dataRootOrParams)`
- `LiquiditySeeded(launchId, poolId, piAmount, tokenAmount, lpPositionId)`
- `LpLocked(launchId, lockContract, lpPositionId)`
- `Claimed(launchId, user, tokenAmount)`

Even if you keep offchain components (engagement scoring), publishing a root and emitting events makes the process auditable.

