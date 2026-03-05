# 07 — DEX integration patterns (PiRC launch liquidity)

This chapter focuses on *how* a PiRC launch contract interacts with a DEX/AMM to:

- create or select the Pi/Token pool,
- seed liquidity with \((C,\;T_{liquidity})\),
- lock the initial liquidity position,
- and safely open trading at TGE.

---

## 1) Choose your DEX integration model

### Model A: “Factory + Pool + Router” (common on EVM)

You usually integrate with:

- **Factory**: creates pools for token pairs
- **Pool**: holds reserves and executes swaps
- **Router**: helper that adds/removes liquidity and routes swaps

### Model B: “Protocol-native liquidity pools” (common outside EVM)

Some ecosystems expose liquidity pools through protocol operations rather than a router contract. The integration pattern is still:

- find/create pool,
- deposit both assets,
- receive a pool share receipt,
- lock the receipt.

---

## 2) Pool creation and uniqueness

If the Pi/Token pool may already exist:

- enforce you are seeding **the canonical pool** for this launch (store `poolId` in launch state);
- do not allow switching pools after seeding.

If the pool does not exist:

- create it once at launch finalization (or earlier in draft),
- store `poolId` in the launch state,
- emit an event so indexers can link the launch to the pool.

---

## 3) Seeding liquidity (PiRC Design 1)

At the seeding step, the escrow must have:

- Pi balance: **exactly the committed Pi** \(C\) (or \(C\) minus defined refunds)
- Token balance: the project’s **liquidity bucket** \(T_{liquidity}\)

Then call:

- `addLiquidity(C, T_liquidity, minC, minT, deadline)` (router style), or
- equivalent protocol pool deposit operation.

### Why `minC` / `minT` matters

DEX implementations often allow the pool price to move between “quote” and “execution.” Setting min amounts:

- protects against unexpected execution due to MEV/front-running,
- forces the transaction to revert if the pool state is not as expected.

For a “first seed” into an empty pool, you typically enforce:

- pool is empty (or not initialized),
- seeding sets the initial price to \(p_{list}=\frac{C}{T}\).

---

## 4) Locking the LP position

After adding liquidity, the DEX returns some representation of ownership:

- LP tokens (fungible), or
- a position NFT (concentrated liquidity), or
- a pool share receipt.

PiRC requires the initial position to be locked.

### Strong lock (recommended)

Send the position immediately to a `LiquidityLock` contract that:

- does **not** implement withdrawal of principal, and/or
- can only withdraw accrued fees (if you want fees to fund a treasury).

### Weaker lock (time-based)

You may time-lock withdrawals for \(N\) years, but this is weaker than a permanent lock.

---

## 5) Opening trading (TGE)

Smart contracts can represent “market opening” as:

- a state change `TGE_OPEN`, and
- optional controls:
  - allow claims before trading,
  - or open trading first then allow claims.

If the DEX is permissionless, you cannot truly stop swaps once liquidity exists; instead you ensure:

- liquidity is seeded **only when you intend**,
- and seeding is atomic with locking the LP position.

---

## 6) Fee routing and sustainability

AMM swaps generate fees that accrue to LPs (the locked position).

Design choices:

- **Fees burned**: simplest, but does not fund anything.
- **Fees to treasury**: `LiquidityLock` can periodically withdraw only fees (not principal) to a treasury.
- **Fees to savers** (future): route fees to a savings yield module.

PiRC’s main promise is *not about fees*, but fees are a useful “engine” to fund product incentives while keeping liquidity permanent.

---

## 7) Integration checklist (PiRC specific)

- Pool ID is fixed and emitted at launch creation/finalization.
- Escrow holds \(C\) Pi and \(T_{liquidity}\) tokens before seeding.
- Seeding is done once; repeated calls must fail.
- LP position is locked in the same transaction sequence (or same atomic transaction if the chain supports it).
- No function exists that transfers \(C\) Pi to the project.

