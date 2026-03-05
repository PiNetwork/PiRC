# FAQ

## Why do we need smart contracts if we already have a backend?

Because PiRC is making **economic guarantees** (especially “committed Pi becomes liquidity”). A backend can enforce policy, but a contract can enforce **invariants** that are harder to break and easier to audit.

## Does PiRC require everything to be onchain?

No. PiRC requires the *critical value paths* to be onchain:

- commitments custody,
- liquidity seeding,
- liquidity lock,
- and distribution rules.

Engagement scoring and UI can stay offchain (ideally with verifiable outputs).

## How do we support engagement-based discounts if engagement is offchain?

Compute engagement tiers offchain, then publish a **Merkle root** onchain. Users claim with a proof. Anyone can recompute the tree from the underlying data and compare to the root.

## Can the project ever access the committed Pi?

In a PiRC-aligned contract design, **no**. The contract should not have a function that transfers committed Pi to the project. The committed Pi leaves escrow only through **DEX liquidity seeding** (and potentially refunds on cancellation).

## What prevents the project from removing the initial liquidity later?

A **liquidity lock** contract holds the LP position and does not expose a withdrawal path for the project.

## What is the main math I need to understand?

- PiRC Design 1 listing/clearing price: \(p_{list}=\frac{C}{T}\)
- Base allocation: \(t_i^{base}=c_i\cdot\frac{T}{C}\)
- AMM constant product: \(x\cdot y=k\), spot price \(p=\frac{x}{y}\)

