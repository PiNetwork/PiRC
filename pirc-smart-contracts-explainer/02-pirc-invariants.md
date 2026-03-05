# 02 — PiRC invariants (rules smart contracts must enforce)

PiRC is not just a UI or a process document. It is a set of **economic promises**.

The point of smart contracts here is to encode these promises as **invariants**:

- if the system is functioning, the invariant always holds;
- if someone tries to violate it, the transaction reverts/fails.

---

## Invariant A: committed Pi is liquidity, not revenue

**Rule:** Participant commitments \(C\) are not transferred to the project team. They are used to seed liquidity in a DEX pool for \(\text{Pi} \leftrightarrow \text{Token}\).

**Onchain enforcement pattern:**

- Participants pay Pi into an **Escrow** contract during the commitment window.
- At allocation/TGE, Escrow deposits **all committed Pi \(C\)** and the project’s **liquidity token bucket \(T_{liquidity}\)** into the AMM pool.
- The project never gains a withdrawal right over \(C\).

**What must be impossible:**

- a “withdraw commitments” function callable by the project,
- a backdoor admin function that routes commitments to the project,
- a “temporary hold then forward” pattern.

---

## Invariant B: initial liquidity cannot be rugged

**Rule:** The entity that seeds the initial liquidity must not be able to later withdraw it.

PiRC describes a “restricted escrow wallet” whose withdrawal is disabled after seeding the LP.

**Smart contract equivalents:**

- **LP token lock**: the liquidity position (LP shares / NFT) is held by a `LiquidityLock` contract that does not expose a withdrawal path for the project.
- **Time lock (weaker)**: liquidity can only be withdrawn after \(t\) years. This reduces rug risk, but does not eliminate it.
- **Permanent lock (strongest)**: no withdrawal function exists at all, or it can only burn the position.

**Security note:** Prefer “can’t withdraw” over “won’t withdraw.” A timelock is a policy; a permanent lock is an invariant.

---

## Invariant C: launch phases are explicit and irreversible (where appropriate)

PiRC launches have phases (participation → allocation → TGE → post-launch). A smart contract should represent these phases as a **state machine**.

Typical states:

- `DRAFT`
- `PARTICIPATION_OPEN`
- `PARTICIPATION_CLOSED`
- `ALLOCATION_FINALIZED`
- `TGE_OPEN`
- `CANCELLED` (optional)

**Rule:** Functions must check the state.

Examples:

- `commit()` is only valid in `PARTICIPATION_OPEN`.
- `finalizeAllocation()` is only valid after participation closes.
- `seedLiquidity()` is only valid once.

---

## Invariant D: allocation math is deterministic and auditable

The allocation mechanism is where “trust” often fails.

PiRC Design 1 uses simple, auditable math with notation like:

- \(C\) = total committed Pi
- \(T_{purchase}\) = tokens sold to participants
- \(T_{liquidity}\) = tokens seeded into the LP
- \(p_{list} = \frac{C}{T}\) (when \(T_{purchase}=T_{liquidity}=T\))

**Contract goal:** once the inputs are fixed (commitments, token buckets, optional engagement tiers), any participant can recompute:

- their purchased tokens,
- their discount/bonus tokens (if used),
- and the pool’s initial reserves.

To make this onchain:

- store the input parameters in contract state,
- emit events for commitments and finalization,
- and ensure finalization is either (a) computed onchain, or (b) verified onchain from a committed data root.

---

## Invariant E: project token supply + vesting is enforced (no surprise minting)

PiRC encourages clear unlock schedules and alignment between team and community.

**Contract patterns:**

- **Fixed supply token**: no mint after initialization.
- **Mintable token with caps**: minting only via `LaunchManager`, bounded by a hard cap.
- **Vesting contracts**: team/community buckets locked with linear or cliff vesting.

**Example linear vesting formula** (for an allocation \(A\)):

\[
V(t) = 
\begin{cases}
0, & t < t_0 \\
A \cdot \frac{t - t_0}{t_1 - t_0}, & t_0 \le t \le t_1 \\
A, & t > t_1
\end{cases}
\]

Where:

- \(t_0\) = vesting start,
- \(t_1\) = vesting end.

---

## Invariant F: “admin” cannot violate PiRC economics

Many launchpads fail because a privileged role can:

- redirect funds,
- override allocations,
- withdraw “locked” liquidity,
- or mint extra tokens.

If you need admin controls, keep them **outside** PiRC invariants:

- Admin can pause in emergencies (halts new commits/swaps), but cannot seize funds.
- Admin can upgrade only through transparent, time-delayed governance.

---

## Summary checklist

A PiRC-aligned smart contract system should make the following impossible:

- committed Pi reaching the project wallet;
- initial LP position being withdrawn by the project;
- allocation being changed after it’s finalized;
- extra token minting beyond the defined buckets/cap;
- calling launch functions in the wrong phase.

