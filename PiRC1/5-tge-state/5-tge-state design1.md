# 5 — TGE State: Design Body

**Scope:** PiRC1 / `5-tge-state`
**Chain:** Pi Network (Stellar/Soroban) — schema/patterns reusable for Solana & Ethereum launchpad variants
**Status:** Consolidated from `5-tge-state design 1.md` + `5-tge-state design 2.md`

> **Note on source content:** the previous `5-tge-state-design-body-english.md` in this
> folder contained an unrelated generic "Temporal Graph Embedding" ML document (graph
> adjacency matrices, GNN loss functions, stock-market case studies) — it does not
> describe the Token Generation Event mechanics used elsewhere in the repo. This file
> replaces it with the actual TGE design body, merged from Design 1 and Design 2.

---

## 1. What TGE means in this repo

The **Token Generation Event (TGE)** is the moment allocation rollout ends and the
Liquidity Pool (LP) opens for unrestricted public access. From this point on, price
discovery happens purely through AMM swaps against the LP — there is no more
controlled/whitelisted phase.

Both designs share the same invariant:

> **Result:** No project team can drain liquidity. Every project launched on the Pi
> Launchpad is backed by an immutable initial liquidity position, because the escrow
> wallet that seeds the LP is permanently locked and can never withdraw.

They differ only in **how** the LP gets seeded before TGE.

---

## 2. Design 1 — Single-Shot Escrow Deposit

The Escrow Wallet seeds the LP **once**, in a single `deposit()` call, using:

| Component | Amount |
|---|---|
| Pi deposited | All committed Pi, $C$ |
| Token deposited | Project liquidity bucket, $T_{liquidity} = T$ |

At TGE the LP therefore holds **≈48.7%** of the project's circulating supply
($\frac{T}{2T + T_{engage}}$). The depositor (Escrow Wallet) is then permanently
locked out of withdrawal.

### Token / price-floor analysis

Constant-product AMM: $x \cdot y = k$, where $x$ = Pi reserve, $y$ = token reserve.

- $x_{TGE} = C$, $y_{TGE} = T$ → $k = CT$
- Worst case: every participant sells their entire holding
  ($T_{out} = T_{purchase} + T_{engage} = T + T_{engage}$) back into the pool
- $y_{min} = 2T + T_{engage}$
- $x_{min} = \dfrac{k}{y_{min}} = \dfrac{CT}{2T + T_{engage}}$
- **Price floor:** $p_{floor} = \dfrac{x_{min}}{y_{min}} = \dfrac{CT}{(2T+T_{engage})^2}$

Relative to listing price $p_{list} = C/T$:

$$p_{floor} = \left(\frac{T}{2T+T_{engage}}\right)^2 p_{list} = \frac{p_{list}}{\left(2+\frac{T_{engage}}{T}\right)^2}$$

- Base case ($T_{engage} = 0$): $p_{floor} = 0.25\,p_{list}$
- With rewards parameter $T_{engage} = 5\%T$: $p_{floor} \approx 0.238\,p_{list}$ (no upper bound)

**Intuition:** even in the "everyone dumps everything" scenario, the pool still holds
~48.8% of the initial Pi commitment and 100% of tokens in circulation, which
mathematically floors the price at ~23.8% of listing.

---

## 3. Design 2 — Phased Deposit (Step 2 → Step 3)

Instead of one deposit, the LP is built up in two on-chain steps:

| Step | LP token reserve | LP Pi reserve | LP shares held by |
|---|---|---|---|
| **Step 2** (initial deposit) | 80% of launch token allocation | 50% of committed Pi | Escrow Wallet (100%) |
| **Step 3** (controlled swaps only, no deposit/withdraw) | 40% of launch token allocation | 100% of committed Pi | Escrow Wallet (100%) |

TGE begins once Step 3 completes. As in Design 1, the Escrow Wallet's withdrawal is
permanently disabled — same "no team can drain liquidity" guarantee.

### Token / price-floor analysis

- $x_{TGE} = C$, $y_{TGE} = 0.4T$ → $k = 0.4CT$
- Remaining launch allocation outside the pool: $T_{out} = T - 0.4T = 0.6T$
- Worst case (all $T_{out}$ sold back): $y_{min} = 0.4T + 0.6T = T$
- $x_{min} = \dfrac{k}{y_{min}} = \dfrac{0.4CT}{T} = 0.4C$
- **Price floor:** $p_{floor} = \dfrac{x_{min}}{y_{min}} = \dfrac{0.4C}{T}$

Relative to listing price $p_{list} = \dfrac{C}{0.4T}$:

$$p_{floor} = 0.16\,p_{list}$$

**Intuition:** even in the "everyone sells everything" scenario, the pool still holds
$0.4C$ Pi and all $T$ tokens, which floors the price at 16% of listing — tighter than
Design 1 because a larger share of Pi (100% vs. ~48.8%) is locked in relative to the
smaller token reserve at TGE.

---

## 4. Design 1 vs. Design 2 — comparison

| | Design 1 (single-shot) | Design 2 (phased) |
|---|---|---|
| Deposit steps | 1 | 2 (step_2, step_3) |
| LP token reserve @ TGE | $T$ (100% of $T$) | $0.4T$ (40% of $T$) |
| LP Pi reserve @ TGE | $C$ (100% of $C$) | $C$ (100% of $C$, but built over 2 steps) |
| $p_{list}$ | $C/T$ | $C/0.4T$ |
| $p_{floor}$ (worst case) | $\approx 0.238\,p_{list}$ | $0.16\,p_{list}$ |
| Escrow lock | Permanent, post single deposit | Permanent, post step_3 |

Both designs enforce the same immutable-liquidity guarantee; Design 2 trades a lower
worst-case floor (as % of listing) for a smaller, more capital-efficient LP token
reserve at open (40% vs. 100% of $T$), with Pi committed over two on-chain steps
instead of one.

---

## 5. Database layer

The state model above (`launch_config`, `escrow_wallet`, `lp_state_snapshot`,
`price_analysis`, `swap_event`) is implemented twice, kept in lockstep:

- **`tge-state.mql.js`** — full MongoDB Query Language implementation: JSON-schema
  validators, seeded demo data for both designs, and aggregation pipelines
  (`recomputePriceFloor`, `rolloutTimeline`, `unlockedEscrowAudit`) that recompute
  the price-floor bounds live from the raw reserve snapshots rather than trusting
  cached values.
- **`tge-state.sql`** — PostgreSQL twin: same tables/columns, a `compute_price_floor()`
  PL/pgSQL function reproducing the same formulas, and a `v_escrow_lock_audit` view
  that should always return zero rows (the "no team can drain liquidity" invariant,
  queryable).

Both are seeded with the same numeric example ($C = T = 1{,}000{,}000$,
$T_{engage} = 50{,}000$ for Design 1) and both independently reproduce the
**0.238 × p_list** (Design 1) and **0.16 × p_list** (Design 2) results quoted above —
used as a cross-check that the schema correctly encodes the design math.

---

## 6. Next

[`Design 2`](<../4-allocation/4-allocation design 2.md>)
