# Allocation Period Design — Mathematical Foundations and Applications

## Chapter 1: Basic Concepts and Theoretical Foundations

### 1.1 Definition of the Allocation Period

The **Allocation Period** is the phase of a Pi Ecosystem token launch during which committed Pi ($C$) and project tokens ($T$) are converted into (a) tokens delivered to participants and (b) a seeded Liquidity Pool (LP). Two alternative designs are specified:

- **Design 1**: a single-clearing-price model built entirely from a **Deposit** operation, with an engagement-based discount layered on top.
- **Design 2**: a two-stage model combining a **fixed-price direct sale** with an **LP deposit**, followed by **engagement-gated swaps** that determine each participant's final effective price.

**Definition 1.1.1**: Let a launch be described by the tuple $(C, T, p_{list})$, where $C$ is total committed Pi, $T$ is the relevant token allocation, and $p_{list}$ is the listing price (Pi per token) at which the Liquidity Pool is initialized.

### 1.2 The Constant-Product Invariant

Both designs ultimately seed a constant-product Automated Market Maker (AMM) of the form:

$$
x \cdot y = k
$$

where $x$ is the Pi reserve, $y$ is the token reserve, and $k$ is preserved across swaps (ignoring fees). This invariant underlies every price-discovery calculation used below.

### 1.3 Effective Price as a Weighted Harmonic Mean

For Design 2, a participant's **effective acquisition price** across the two equal-Pi buckets is the **harmonic mean** of the two bucket prices; Design 1 instead adds a token bonus to its base allocation.

$$
p_{eff} = \frac{2\,p_1\,p_2}{p_1 + p_2}
$$

This follows directly from the definition of price as Pi paid divided by tokens received: if equal Pi amounts are spent at $p_1$ and $p_2$, the token-weighted average price is the harmonic — not arithmetic — mean.

---

## Chapter 2: Design 1 — Single Clearing Price with Engagement Discount

### 2.1 Bucket Structure

Design 1 fixes:

$$
T = T_{purchase} = T_{liquidity}, \qquad T_{engage} = 0.05\,T
$$

so total token supply to the Launchpad is $2.05T$, forming the initial circulating supply at TGE.

### 2.2 Base Allocation

The Escrow Wallet deposits $(C, T)$ into the LP, setting:

$$
p_{list} = \frac{C}{T}
$$

Each participant $i$ with commitment $c_i$ receives base tokens:

$$
t_i^{base} = \frac{c_i}{p_{list}}
$$

**Proposition 2.2.1**: Since every participant is allocated at the same $p_{list}$, base allocation alone induces no price dispersion across participants — dispersion is introduced entirely by the engagement layer in Section 2.3.

### 2.3 Engagement-Tiered Discount

Participants are ranked by Engagement Score into three equal-sized tiers ($S_{top}, S_{mid}, S_{bottom}$), with $T_{engage}$ distributed:

$$
t_i^{engage} =
\begin{cases}
\dfrac{2}{3}T_{engage}\cdot\dfrac{c_i}{C_{top}}, & i \in S_{top} \\[6pt]
\dfrac{1}{3}T_{engage}\cdot\dfrac{c_i}{C_{mid}}, & i \in S_{mid} \\[4pt]
0, & i \in S_{bottom}
\end{cases}
$$

**Theorem 2.3.1** (Tier Bonus): If each tier holds exactly one-third of total commitment (for example, all participants commit equally), the token bonus over base allocation is:

$$
b_{top} = \frac{2/3 \cdot 0.05}{1/3} = 10\%, \qquad
b_{mid} = \frac{1/3 \cdot 0.05}{1/3} = 5\%, \qquad
b_{bottom} = 0\%
$$

*Proof*: Each tier holds exactly $1/3$ of total commitment (uniform assumption), so the per-participant bonus reduces to the tier's $T_{engage}$ share divided by its commitment share. Substituting the fixed shares $2/3, 1/3, 0$ against $1/3$ gives the stated bounds. $\blacksquare$

### 2.4 Normalized Effective Price

Given bonus $b_i = t_i^{engage}/t_i^{base}$, the effective price simplifies to:

$$
\frac{p_{eff,i}}{p_{list}} = \frac{1}{1+b_i}
$$

which yields the three step-function levels reported in the design doc: $0.909$ (top), $0.952$ (mid), $1.000$ (bottom).

### 2.5 Invariant Checks

- **Conservation**: $\sum_i t_i^{base} = T$ and $\sum_i t_i^{engage} \le T_{engage}$ by construction (tier shares sum to $2/3+1/3+0=1$ within each tier's own pool).
- **No-free-rider**: $t_i^{engage} = 0$ whenever $c_i = 0$, since discount is always scaled by $c_i / C_{tier}$.
- **Escrow lock**: Once $(C, T)$ is deposited, the Escrow Wallet's signing authority should be permanently removed — mirrored by the `permanently_locked` flag in the accompanying database schema.

---

## Chapter 3: Design 2 — Fixed Price Plus Engagement-Gated Swaps

### 3.1 Token and Pi Splits

Design 2 splits the launch allocation $T$ 80/20 and committed Pi $C$ 50/50:

$$
T_{LP} = 0.8T, \quad T_{fixed} = 0.2T, \qquad C_{deposit} = C/2, \quad C_{swap} = C/2
$$

### 3.2 Step 1 — Fixed-Price Delivery

$$
p_{list} = \frac{C/2}{0.2T} = \frac{C}{0.4T}
$$

### 3.3 Step 2 — Pool Seeding and the Quarter-Price Identity

The remaining $C/2$ is paired with $0.8T$ to seed the LP:

$$
p_{init} = \frac{C/2}{0.8T} = \frac{p_{list}}{4}, \qquad k = \frac{C}{2}\cdot 0.8T = 0.4\,CT
$$

**Lemma 3.3.1**: The initial LP spot price is always exactly $1/4$ of the fixed listing price, independent of the absolute magnitudes of $C$ and $T$ — a direct consequence of the fixed 80/20 and 50/50 splits, not an empirical coincidence.

### 3.4 Step 3 — Ranked Swap Curve

Let $s \in [0, C/2]$ denote cumulative Pi swapped in engagement-rank order. Reserves evolve as:

$$
x(s) = \frac{C}{2}+s, \qquad y(s) = \frac{k}{x(s)}
$$

so the marginal swap price is:

$$
p_{swap}(s) = \frac{x(s)}{y(s)} = \frac{x(s)^2}{k}
$$

**Theorem 3.4.1** (Normalized Swap Curve): Substituting $x(s)$ and $k = 0.4CT$, then eliminating $T$ via $p_{list} = C/(0.4T)$, gives:

$$
\frac{p_{swap}(s)}{p_{list}} = \frac{1}{4}\left(1+\frac{2s}{C}\right)^2
$$

*Proof*: $p_{swap}(s) = x(s)^2/k = (C/2+s)^2/(0.4CT)$. Dividing by $p_{list}=C/(0.4T)$ gives $(C/2+s)^2/(0.4CT) \cdot 0.4T/C = (C/2+s)^2/C^2 = \tfrac{1}{4}(1+2s/C)^2$. $\blacksquare$

This is monotonically increasing from $1/4$ at $s=0$ to $1$ at $s=C/2$, confirming continuity with the Step 2 price floor and the Step 1 listing price.

### 3.5 Effective Price and Discount Range

Since Bucket A ($C/2$ at $p_{list}$) and Bucket B ($C/2$ at $p_{swap}(s)$) are equal-weighted:

$$
p_{eff}(s) = \frac{2\,p_{list}\,p_{swap}(s)}{p_{list}+p_{swap}(s)}
$$

**Corollary 3.5.1**: $p_{eff}(0) = 0.4\,p_{list}$ (a 60% discount for the most-engaged participant) and $p_{eff}(C/2) = p_{list}$ (no discount for the least-engaged participant), matching the stated discount range of 0%–60%.

### 3.6 Lockup Policy as a Function of Discount

The design ties lockup duration to discount depth: participants transacting near $s=0$ (steepest discount) receive the longest lockups on their Step-3 tokens, while Step-1 tokens (fixed price, no discount) carry no lockup. This creates a monotone relationship:

$$
\text{lockup\_days}(s) \; \text{is non-increasing in } s
$$

which the accompanying schema encodes via the `lockup_days` field on `swap_execution`, populated per participant at execution time rather than derived analytically (since exact lockup schedules are a policy parameter, not a closed-form function of $s$ alone).

---

## Chapter 4: Comparative Analysis

### 4.1 Structural Differences

| Aspect | Design 1 | Design 2 |
|---|---|---|
| LP operation | Deposit only | Deposit + Swap |
| Price discovery | Single clearing price | Fixed price + AMM curve |
| Discount mechanism | Discrete 3-tier bonus | Continuous rank-based curve |
| Discount range | 0%–10% (avg., uniform case) | 0%–60% |
| Escrow lock | Immediate, single deposit | After Step 2 deposit |
| Lockups | None | Tied to discount depth |

### 4.2 When Each Design Applies

Design 1's discrete tiers are simpler to reason about and audit (three clearing prices total), suitable for launches prioritizing predictability. Design 2's continuous curve provides finer-grained engagement rewards at the cost of AMM-driven price variance and lockup bookkeeping, suitable for launches wanting stronger incentive differentiation.

### 4.3 Shared Invariants Across Both Designs

Regardless of design, the accompanying database schema (`allocation-state.mql.js` / `allocation-state.sql`) enforces:

1. **Escrow immutability**: every `escrow_wallet` used to seed an LP is eventually `permanently_locked = true`.
2. **Conservation of tokens**: allocation results per participant must not exceed the design's stated bucket totals.
3. **Rank monotonicity**: `engagement_rank` (Design 1's tiers, Design 2's swap order) strictly determines discount ordering — no participant with a lower engagement score receives a better effective price than one with a higher score, holding commitment size constant.

---

## Chapter 5: Worked Numerical Example

Using the seed data in `allocation-state.mql.js` / `allocation-state.sql`:

**Design 1** ($C=300{,}000$, $T=300{,}000$, $T_{engage}=15{,}000$, three participants of $100{,}000$ Pi each, one per tier):

- $p_{list} = 300{,}000/300{,}000 = 1.0$
- Top: $p_{eff}/p_{list} \approx 0.909$
- Mid: $p_{eff}/p_{list} \approx 0.952$
- Bottom: $p_{eff}/p_{list} = 1.000$

**Design 2** ($C=1{,}000{,}000$, $T=1{,}000{,}000$, five participants ranked 1–5):

- $p_{list} = 1{,}000{,}000/(0.4 \times 1{,}000{,}000) = 2.5$
- Rank 1 ($s=0$): $p_{eff}/p_{list} = 0.400$
- Rank 5 ($s=C/2$): $p_{eff}/p_{list} = 1.000$
- Intermediate ranks interpolate along the curve in Theorem 3.4.1.

Both sets of figures reproduce the values quoted in `4-allocation design 1.md` and `4-allocation design 2.md`, and are cross-checked by `compute_design1_allocation()` / `compute_design2_swap_curve()` in the SQL companion file.

---

## Appendix: Mathematical Notation Reference

| Symbol | Meaning |
|---|---|
| $C$ | Total Pi committed by participants |
| $T$ | Token allocation (meaning varies slightly by design; see notation blocks in each design doc) |
| $T_{purchase}, T_{liquidity}, T_{engage}$ | Design 1 buckets |
| $p_{list}$ | Listing price (Pi per token) |
| $p_{init}$ | Design 2 initial LP spot price |
| $p_{swap}(s)$ | Design 2 marginal swap price at cumulative flow $s$ |
| $p_{eff}$ | Participant's effective acquisition price |
| $k$ | Constant-product AMM invariant |
| $t_i^{base}, t_i^{engage}$ | Base and engagement-bonus token amounts for participant $i$ |
| $b_i$ | Tier/rank token bonus over base allocation |

---

**Document Version**: v1.0
**Companion files**: `pirc_allocation_design1.json`, `pirc_allocation_design2.json`, `allocation-state.mql.js`, `allocation-state.sql`
**Language**: English
**License**: CC-BY-4.0
**Status**: Complete and ready for community review
