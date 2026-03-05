# 11 — End-to-end worked example (PiRC ↔ smart contracts ↔ DEX)

This is a single “walkthrough” that ties everything together using concrete numbers and the PiRC Design 1 math.

---

## Setup

Assume the project chooses:

- \(T_{purchase}=T_{liquidity}=T=1{,}000{,}000\) tokens
- \(T_{engage}=0.05T=50{,}000\) tokens (optional bonus)

During participation, total commitments end up:

- \(C=100{,}000\) Pi

Therefore listing/clearing price:

\[
p_{list}=\frac{C}{T}=\frac{100{,}000}{1{,}000{,}000}=0.1\ \text{Pi/token}
\]

---

## Step A — Commitments (Escrow contract)

Three users commit:

- Alice: \(c_A=1{,}000\) Pi
- Bob: \(c_B=9{,}000\) Pi
- Carol: \(c_C=90{,}000\) Pi

Contract state after close:

- `totalCommittedC = 100,000`
- `committed[A]=1,000`, etc.

---

## Step B — Allocation (base tokens)

Base allocation uses:

\[
t_i^{base}=c_i\cdot\frac{T}{C}
\]

So:

- Alice: \(t_A^{base}=1{,}000\cdot\frac{1{,}000{,}000}{100{,}000}=10{,}000\)
- Bob: \(t_B^{base}=90{,}000\)
- Carol: \(t_C^{base}=900{,}000\)

Check:

\[
10{,}000+90{,}000+900{,}000 = 1{,}000{,}000 = T_{purchase}
\]

---

## Step C — Liquidity seeding (DEX pool)

Escrow seeds:

- \(x=C=100{,}000\) Pi
- \(y=T_{liquidity}=1{,}000{,}000\) tokens

AMM invariant:

\[
k=xy=100{,}000\cdot 1{,}000{,}000 = 10^{11}
\]

Spot price:

\[
p=\frac{x}{y}=0.1\ \text{Pi/token}
\]

Escrow receives an LP position and immediately transfers it to `LiquidityLock`.

---

## Step D — Claims

After liquidity is seeded and allocation is finalized:

- Alice calls `claim()` and receives \(10{,}000\) tokens (plus any bonus proven).
- Bob receives \(90{,}000\).
- Carol receives \(900{,}000\).

---

## Step E — A sample swap (price impact intuition)

Suppose a trader swaps \(\Delta x = 1{,}000\) Pi into the pool (ignore fees for simplicity).

New \(x' = 101{,}000\).

New \(y'=\frac{k}{x'}=\frac{10^{11}}{101{,}000}\approx 990{,}099.01\).

So tokens out:

\[
\Delta y \approx 1{,}000{,}000 - 990{,}099.01 \approx 9{,}900.99
\]

Average execution price:

\[
\frac{1{,}000}{9{,}900.99}\approx 0.1010\ \text{Pi/token}
\]

which is slightly worse than the spot \(0.1\) because of slippage.

---

## Step F — PiRC “floor price” bound (worst-case sell pressure)

Participants hold outside the pool:

\[
T_{out}=T_{purchase}+T_{engage}=1{,}000{,}000+50{,}000=1{,}050{,}000
\]

If all of \(T_{out}\) is eventually sold into the pool, the pool token reserve becomes:

\[
y_{min}=T + T_{out}=2T+T_{engage}=2{,}050{,}000
\]

Then:

\[
p_{floor}\approx \frac{p_{list}}{(2.05)^2}\approx 0.238\,p_{list}\approx 0.0238\ \text{Pi/token}
\]

This is not a promise of market price; it is a mathematical bound from the constant-product model under that extreme scenario.

---

## What this example demonstrates (PiRC relation)

- The contract architecture makes it impossible for the project to receive \(C\) Pi directly.
- The DEX pool is initialized at the same implied price participants paid.
- The initial liquidity position is lockable, preventing a classic rug pull.

