# 01 — Smart contract basics (for PiRC)

## What is a smart contract?

A **smart contract** is a program deployed on a blockchain that:

- **Holds assets** (tokens / coins) under code-defined rules
- **Exposes functions** (transactions can call them)
- **Updates state** in a way that every node can verify

For PiRC, we want a contract to guarantee the launch rules even if:

- a server goes down,
- an admin key is compromised,
- a project tries to cheat,
- or a participant disputes the math.

---

## The mental model

### “Wallet” vs “contract”

- A **wallet** is controlled by keys (humans/servers).
- A **contract** is controlled by code.

PiRC’s most important promise—**committed Pi becomes liquidity, not project revenue**—is strongest when a contract enforces it.

---

## Onchain vs offchain (and why PiRC cares)

Most real systems split responsibilities:

- **Onchain**: custody of funds + irreversible rules (invariants)
- **Offchain**: UI, indexing, analytics, and *sometimes* eligibility computations

For PiRC, your “must-be-onchain” set is usually:

- **Commitment custody**: participant commits go to an escrow contract
- **LP seeding**: escrow seeds liquidity into the DEX pool
- **Liquidity lock**: the project cannot withdraw the initial LP position
- **Token distribution**: minted/transferred according to allocation rules

Offchain is fine for:

- engagement scoring (it depends on product events),
- dashboards,
- reporting.

But if offchain computes something that affects money (e.g., “who gets how many tokens”), you generally want **verifiable inputs** and **auditable outputs**.

---

## Roles and permissions (typical)

PiRC has naturally distinct actors:

- **Platform / Launchpad**: creates launches, enforces rules
- **Project**: supplies tokens, provides app, cannot take committed Pi
- **Participants**: commit Pi, receive token allocation
- **DEX/AMM**: provides pool mechanics for swaps and liquidity

In contracts, these become addresses with permissions, such as:

- `ADMIN` (optional)
- `PROJECT_OWNER`
- `LAUNCH_OPERATOR` (often the Launchpad itself)

The design goal is to keep “powerful” roles from being able to break PiRC invariants.

---

## The minimal PiRC contract set (preview)

Most PiRC-aligned implementations can be modeled with:

1. **Project Registry** (optional onchain)
   - tracks approved projects / owners
2. **Launch Manager**
   - creates launches, holds launch state
3. **Escrow**
   - receives commitments, seeds LP, distributes purchased tokens
4. **Liquidity Lock**
   - prevents withdrawal of the initial LP position
5. **Vesting**
   - enforces team / treasury vesting schedules

We’ll define these concretely in the next chapters.

