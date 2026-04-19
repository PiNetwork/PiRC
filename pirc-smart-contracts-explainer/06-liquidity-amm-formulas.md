# 06 — Liquidity seeding & AMM formulas (PiRC ↔ DEX)

PiRC’s core promise (“committed Pi becomes liquidity”) depends on how AMMs work. This chapter provides the formulas you need to reason about the pool, price, and downside bounds described in the PiRC docs.

---

## 1) Constant-product AMM basics

Let:

- \(x\) = Pi reserve in the pool
- \(y\) = token reserve in the pool

In a constant-product AMM (ignoring fees):

\[
x\cdot y = k
\]

The **spot price** (Pi per token) is:

\[
p=\frac{x}{y}
\]

---

## 2) PiRC Design 1: initial seeding reserves

From PiRC Design 1:

- total committed Pi is \(C\)
- liquidity bucket deposited is \(T_{liquidity}=T\)

So at TGE seeding:

\[
x_{TGE}=C,\quad y_{TGE}=T,\quad k=CT
\]

This makes the initial spot price:

\[
p_{list}=\frac{C}{T}
\]

which matches the allocation clearing price \(p=\frac{C}{T}\).

---

## 3) Swaps with fees (typical DEX implementation)

Most AMMs take a pool fee \(f\) (e.g. 0.3%).

If a trader swaps \(\Delta x\) Pi into the pool, the effective input after fee is:

\[
\Delta x' = \Delta x (1-f)
\]

New reserves become:

\[
x' = x + \Delta x'
\]

And the output tokens are:

\[
\Delta y = y - \frac{k}{x'}
= y - \frac{xy}{x+\Delta x'}
= \frac{y\Delta x'}{x+\Delta x'}
\]

This exact formula is what you typically implement or verify against a DEX router.

---

## 4) Slippage (useful approximation)

With no fee and small trades, price impact scales with trade size relative to reserves.

If you trade \(\Delta x\) into a pool with reserve \(x\), a common approximation for price impact is:

\[
\text{impact} \approx \frac{\Delta x}{x}
\]

But for correctness you should use the exact swap output formula above.

---

## 5) PiRC downside bound (“floor price”) derivation

PiRC Design 1 discusses a theoretical “everyone sells all their tokens” scenario.

At TGE:

- pool reserves: \((x,y)=(C, T)\)
- outside the pool, participants hold:

\[
T_{out}=T_{purchase}+T_{engage}=T+T_{engage}
\]

If all of \(T_{out}\) is sold into the pool over time, the pool token reserve would become:

\[
y_{min} = T + T_{out} = 2T + T_{engage}
\]

By invariant \(k=CT\), the Pi reserve becomes:

\[
x_{min} = \frac{k}{y_{min}}=\frac{CT}{2T+T_{engage}}
\]

So the lower bound on spot price is:

\[
p_{floor}=\frac{x_{min}}{y_{min}}
=\frac{CT}{(2T+T_{engage})^2}
\]

Rewrite using \(p_{list}=\frac{C}{T}\):

\[
p_{floor}
=\left(\frac{T}{2T+T_{engage}}\right)^2 p_{list}
=\frac{p_{list}}{\left(2+\frac{T_{engage}}{T}\right)^2}
\]

Example: if \(T_{engage}=0\), then \(p_{floor}=0.25\,p_{list}\).

If \(T_{engage}=0.05T\), then:

\[
p_{floor}\approx \frac{p_{list}}{(2.05)^2}\approx 0.238\,p_{list}
\]

This matches the PiRC Design 1 narrative.

---

## 6) How contracts enforce “all committed Pi becomes liquidity”

The crucial enforcement is not the math. It’s **where the funds can go**.

A PiRC escrow contract should:

- accept commitments into escrow during the window,
- after close, call DEX `addLiquidity(C, T_liquidity)`,
- immediately send the LP position into `LiquidityLock`,
- never expose a path to withdraw \(C\) to the project.

---

## 7) Practical gotchas (DEX integration)

- **Pool creation**: if the pool doesn’t exist, you need to create it before seeding.
- **Token decimals**: price formulas assume consistent units; contracts must normalize.
- **Min amounts**: `addLiquidity` often requires `minPi` and `minToken` to avoid MEV.
- **Fees**: swap fees shift outputs; use exact formulas and DEX library code.

