# 05 — Commitments & allocation math (PiRC focus)

This chapter mirrors PiRC Design 1 notation and shows how to implement it in smart contracts with **verifiable math**.

---

## 1) Notation (from PiRC docs)

- \(C\): total Pi committed by participants
- \(c_i\): Pi committed by participant \(i\)
- \(T_{purchase}\): tokens allocated to participants (purchase bucket)
- \(T_{liquidity}\): tokens reserved for liquidity seeding
- \(T_{engage}\): tokens allocated for engagement discounts/bonuses (optional)
- \(p_{list}\): listing price (Pi per token) at which the LP is initialized

PiRC Design 1 commonly sets:

\[
T_{purchase}=T_{liquidity}=T
\]

and (example parameter):

\[
T_{engage}=5\%\cdot T
\]

Total token amount supplied by the project to the launchpad becomes:

\[
T_{purchase}+T_{liquidity}+T_{engage}=2.05T
\]

---

## 2) Single clearing price (Design 1)

When \(T_{purchase}=T\), the implied clearing/listing price is:

\[
p=\frac{C}{T}
\]

And the pool is seeded at:

\[
p_{list}=p=\frac{C}{T}
\]

This is PiRC’s key alignment: the “sale” price and the initial AMM price are consistent.

---

## 3) Base token allocation per participant

Participant \(i\) who commits \(c_i\) Pi receives base purchased tokens:

\[
t_i^{base}=\frac{c_i}{p_{list}}
\]

Since \(p_{list}=\frac{C}{T}\), this can be rewritten as a pure pro-rata:

\[
t_i^{base}=c_i\cdot\frac{T}{C}
\]

This pro-rata form is useful in contracts because it avoids division by a computed price until the end.

---

## 4) Engagement-based bonus tokens (optional)

PiRC describes a tiered engagement model (example):

- top \(1/3\) of participants share \(\frac{2}{3}T_{engage}\)
- middle \(1/3\) share \(\frac{1}{3}T_{engage}\)
- bottom \(1/3\) get \(0\)

Let \(S_{top}\), \(S_{mid}\), \(S_{bottom}\) be the sets of participants.

Let tier commitment totals:

\[
C_{top}=\sum_{j\in S_{top}} c_j,\quad C_{mid}=\sum_{j\in S_{mid}} c_j
\]

Then bonus/engagement tokens are:

\[
t_i^{engage}=
\begin{cases}
\frac{2}{3}T_{engage}\cdot \frac{c_i}{C_{top}}, & i \in S_{top}\\
\frac{1}{3}T_{engage}\cdot \frac{c_i}{C_{mid}}, & i \in S_{mid}\\
0, & i \in S_{bottom}
\end{cases}
\]

Total received by participant:

\[
t_i=t_i^{base}+t_i^{engage}
\]

Effective price they paid (for intuition):

\[
p_{eff,i}=\frac{c_i}{t_i}
\]

---

## 5) Worked example (numbers)

Assume:

- total committed \(C=100{,}000\) Pi
- \(T=1{,}000{,}000\) tokens
- so \(p_{list}=\frac{C}{T}=0.1\) Pi/token
- \(T_{engage}=0.05T=50{,}000\) tokens

Participant A commits \(c_A=1{,}000\) Pi.

Base tokens:

\[
t_A^{base}=\frac{1{,}000}{0.1}=10{,}000
\]

If A is in the top tier, and suppose \(C_{top}=40{,}000\) Pi, then:

\[
t_A^{engage}=\frac{2}{3}\cdot 50{,}000\cdot\frac{1{,}000}{40{,}000}
=33{,}333.33\cdot 0.025
\approx 833.33
\]

Total:

\[
t_A\approx 10{,}833.33
\]

Effective price:

\[
p_{eff,A}\approx \frac{1{,}000}{10{,}833.33}\approx 0.0923
\]

So A effectively paid ~7.7% less than \(p_{list}\) due to engagement bonus.

---

## 6) How to implement this in a smart contract

### Option 1: fully onchain accounting (simple, but storage-heavy)

Store every \(c_i\) in contract storage and compute claims as:

- `tBase = c_i * T / C`
- `tEngage` based on tier totals \(C_{top}, C_{mid}\)

This is easy to reason about but can be expensive on some chains.

### Option 2: offchain compute + onchain verification (scalable)

1. During participation, escrow records commitments and emits `Committed(user, amount)`.
2. After window close, an offchain process:
   - computes tier membership and totals,
   - builds a Merkle tree of `(user, c_i, tier, tEngage)` entries,
   - publishes the Merkle root onchain in `finalizeAllocation(root)`.
3. Users claim with a Merkle proof; the contract verifies proof and pays `tBase + tEngage`.

This preserves auditability (anyone can recompute the tree from events) while keeping onchain state small.

---

## 7) PiRC-specific correctness checklist

- \(C\) used in formulas must equal the **actual committed Pi** held by escrow.
- \(T_{liquidity}\) must be deposited by the project before seeding liquidity.
- The sum of all claims must be bounded by \(T_{purchase}+T_{engage}\).
- No function should ever send committed Pi \(C\) to the project.

