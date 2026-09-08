# Allocation Period Design Document — Mathematical Foundations and Applications

## Chapter 1: Basic Concepts and Theoretical Foundations

### 1.1 Purpose of the Allocation Period

The **Allocation Period** is the phase of the PiRC launchpad flow in which participants' committed Pi is converted into project tokens and a Liquidity Pool (LP) is seeded, so that the token can trade freely once the Token Generation Event (TGE) state begins. Two design options are specified for this phase, differing in how the LP is formed and how engagement-based pricing is applied:

- **Design Option 1 — Deposit-Only Model**: a single clearing price, LP formed purely by deposit, with a small token bucket reserved for engagement-tier discounts.
- **Design Option 2 — Deposit + Swap Model**: LP formed with a first deposit followed by a sequence of engagement-ranked swaps, producing a continuum of effective prices rather than discrete tiers.

**Definition 1.1.1 (Common Notation)**: Let
- $C$ = total Pi committed by all participants during the Participation Window,
- $T$ = total ecosystem-token allocation made available through the launchpad for the project,
- $p_{list}$ = listing price of the token, in Pi per token, at which the LP is initialized or converges to.

Both designs share the same governing idea: participants who commit Pi are also ranked by an **Engagement Score**, measured during the Participation Window, and that ranking determines how much of a discount (if any) a participant receives relative to $p_{list}$.

### 1.2 Common State Transition

Independent of design option, the allocation flow follows the same high-level state transition:

$$
\text{Escrow}(C, T) \;\rightarrow\; \text{LP}(x_0, y_0) \;\rightarrow\; \text{Participants receive tokens at } p_{eff,i}
$$

where $x_0$ is the Pi reserve and $y_0$ is the token reserve at LP initialization, and $p_{eff,i}$ is the effective acquisition price realized by participant $i$ after any engagement-based discount is applied.

### 1.3 Escrow Lockup

In both designs, once the Escrow Wallet has deposited its assets into the LP, its signing authority is permanently removed (set to 0) on-chain. This is an irreversible operation that guarantees the initial liquidity seeding the pool can never be withdrawn by any party, including the project team.

---

## Chapter 2: Design Option 1 — Deposit-Only Model

### 2.1 Token and Pi Buckets

This is the **simple-model** allocation: all committed Pi goes into the LP, and each participant receives their base allocation at a single clearing price, with an additional engagement-based bonus paid from a small dedicated bucket.

**Notation**:
- $T_{purchase}$ = tokens allocated to participants (purchase bucket), set equal to $T$
- $T_{liquidity}$ = tokens reserved for liquidity seeding, set equal to $T$
- $T_{engage} = 5\%\,T$ = tokens allocated for engagement discounts

Total tokens supplied by the project to the launchpad:

$$
T_{purchase} + T_{liquidity} + T_{engage} = 2.05\,T
$$

This is the token's initial circulating supply at TGE, including tokens deposited into the LP.

### 2.2 LP Formation and Clearing Price

Participants receive $T_{purchase} = T$ tokens in exchange for total committed Pi $C$, at implied price:

$$
p = \frac{C}{T}
$$

The Escrow Wallet deposits the full $C$ Pi together with $T_{liquidity} = T$ tokens into the LP, so the pool initializes at:

$$
p_{list} = \frac{C}{T} = p
$$

i.e. the LP opens at exactly the price participants paid — there is no separate discovery step. Participant $i$'s base token allocation, proportional to their commitment $c_i$, is:

$$
t_i^{base} = \frac{c_i}{p_{list}}
$$

### 2.3 Engagement-Based Discount

The $T_{engage} = 5\%\,T$ bucket distributes bonus tokens by Engagement Score rank, split into thirds:

- Top 1/3 of participants (by engagement) share $\frac{2}{3}\,T_{engage}$, proportional to their commitment within that tier
- Middle 1/3 share $\frac{1}{3}\,T_{engage}$, proportional to commitment within that tier
- Bottom 1/3 receive no bonus

Formally, with tier commitment totals $C_{top}$ and $C_{mid}$:

$$
t_i^{engage}=
\begin{cases}
\dfrac{2}{3}T_{engage}\cdot \dfrac{c_i}{C_{top}}, & i \in S_{top}\\[6pt]
\dfrac{1}{3}T_{engage}\cdot \dfrac{c_i}{C_{mid}}, & i \in S_{mid}\\[4pt]
0, & i \in S_{bottom}
\end{cases}
$$

Under a uniform commitment assumption across tiers, this works out to roughly a **10% token bonus** for the top tier and **5%** for the middle tier.

### 2.4 Effective Price

Participant $i$'s effective price is:

$$
p_{eff,i} = \frac{c_i}{t_i^{base} + t_i^{engage}} = \frac{p_{list}}{1+b_i}, \qquad b_i = \frac{t_i^{engage}}{t_i^{base}}
$$

Under the uniform assumption:

| Tier | Bonus $b$ | $p_{eff}/p_{list}$ |
|---|---|---|
| Top 1/3 | 10% | ≈ 0.909 |
| Middle 1/3 | 5% | ≈ 0.952 |
| Bottom 1/3 | 0% | 1.000 |

Because the discount comes entirely from a fixed bonus-token bucket, the effective price is a **step function** of engagement tier rather than a smooth curve — every participant in the same tier pays the same effective price.

### 2.5 Summary — Design 1

- LP is formed exclusively by **deposit**; no swap operation is used.
- All committed Pi $C$ and $T$ tokens seed the LP, at $p_{list} = C/T$.
- Participants collectively receive $T + T_{engage}$ tokens.
- Discount is capped at ~10% and applied as a step function across three engagement tiers.

---

## Chapter 3: Design Option 2 — Deposit + Swap Model

### 3.1 Token and Pi Splits

This design uses **both** deposit and swap operations to form the LP, producing a continuous discount curve rather than discrete tiers.

Token allocation $T$ is split 80/20:
- 80% of $T$ is deposited into the LP
- 20% of $T$ is sold at listing price directly to participants

Committed Pi $C$ is split 50/50:
- Bucket A ($C/2$): direct purchase of the 20% fixed-price portion
- Bucket B ($C/2$): engagement-ranked swaps executed against the LP

### 3.2 Step 1 — Fixed-Price Delivery

Half of committed Pi is transferred to the Escrow Wallet and directly buys 20% of $T$ at:

$$
p_{list} = \frac{C/2}{0.2\,T} = \frac{C}{0.4\,T}
$$

### 3.3 Step 2 — Escrow Deposit and Pool Creation

The Pi from Step 1 ($C/2$) is paired with the remaining 80% of $T$ and deposited into the LP:

$$
p_{init} = \frac{C/2}{0.8\,T} = \frac{p_{list}}{4}, \qquad k = \frac{C}{2}\cdot 0.8\,T = 0.4\,C\,T
$$

$k$ is the constant-product invariant of the pool. The Escrow Wallet is then permanently locked.

### 3.4 Step 3 — Automated Engagement-Based Swaps

The remaining $C/2$ is swapped into the LP in order of Engagement Score, highest first. Because the pool follows the constant-product invariant, price rises monotonically as cumulative swap volume $s$ increases:

$$
x(s) = \frac{C}{2}+s, \qquad y(s) = \frac{k}{x(s)}, \qquad p_{swap}(s) = \frac{x(s)^2}{k}
$$

Normalizing by $p_{list}$ (using $k = 0.4\,C\,T$ and $p_{list} = C/(0.4T)$):

$$
\frac{p_{swap}(s)}{p_{list}} = \frac{1}{4}\left(1+\frac{2s}{C}\right)^2, \qquad s \in [0, C/2]
$$

This rises smoothly from $\tfrac14$ at $s=0$ to $1$ at $s = C/2$.

### 3.5 Effective Acquisition Price

Each participant's Pi is split 50/50 across Bucket A (fixed price $p_{list}$) and Bucket B (swap price $p_{swap}(s)$ at their position in the ranking), so the effective price is the harmonic mean:

$$
p_{eff}(s) = \frac{2\,p_{list}\,p_{swap}(s)}{p_{list}+p_{swap}(s)}
$$

with bounds:

$$
p_{eff}(0) = 0.4\,p_{list} \quad (\text{60% discount, most engaged}), \qquad p_{eff}(C/2) = p_{list} \quad (\text{0% discount, least engaged})
$$

Discounted tokens (Step 3 only) carry a post-TGE lockup whose length scales with the size of the discount received; the fixed-price portion (Step 1) is never locked. LP swapping fees (0.3%) are ignored in the simplified formulas above.

### 3.6 Summary — Design 2

- LP formed by **deposit followed by ranked swaps**.
- Discount is a smooth function of Engagement Score rank, up to 60% at the top and 0% at the bottom.
- LP access during the allocation period is restricted to the sequenced, pre-consented swaps; there is no open trading window.

---

## Chapter 4: Comparison of Design Options

| Property | Design 1 (Deposit-Only) | Design 2 (Deposit + Swap) |
|---|---|---|
| LP formation | Single deposit | Deposit, then ranked swaps |
| Pricing curve | Step function (3 tiers) | Continuous (AMM curve) |
| Max discount | ~10% | 60% |
| Extra token supply | $T_{engage}=5\%T$ minted/reserved | None — discount funded from spread between $p_{init}$ and $p_{list}$ |
| Lockups | Not specified for engagement bonus | Length scales with discount, Step 3 tokens only |
| Complexity | Low — one clearing price | Higher — sequenced automated swaps |

Design 1 favors simplicity and a bounded, predictable token overhead. Design 2 favors a wider, market-priced discount range at the cost of operational complexity (ordered, automated swap execution with pre-signed consent).

---

## Chapter 5: Implementation Notes

### 5.1 Automation Requirements

Both designs require no manual participant action after the commitment window closes:
- **Design 1**: bonus token distribution is computed once, after Engagement Score tiers are finalized.
- **Design 2**: swaps are executed automatically in ranked order, using consent signed at the time of commitment; the LP is not open to arbitrary trading until the allocation period ends.

### 5.2 Algorithm — Ranked Swap Execution (Design 2)

```
Input:  Sorted participant list P (descending Engagement Score),
        LP reserves (x0, y0) after Step 2, constant product k
Output: Effective price and token allocation per participant

1. x ← x0                      // Pi reserve, starts at C/2
2. y ← y0                      // Token reserve, starts at 0.8T
3. for each participant i in P do
4.     s_i ← c_i               // this participant's Bucket B commitment
5.     tokens_out ← y - k / (x + s_i)
6.     p_swap_i ← s_i / tokens_out
7.     p_eff_i ← 2 * p_list * p_swap_i / (p_list + p_swap_i)
8.     x ← x + s_i
9.     y ← y - tokens_out
10.    record(i, tokens_out, p_eff_i)
11. end for
```

**Time Complexity**: $O(N)$ in the number of participants $N$, since each swap is a constant-time AMM update.

### 5.3 Data Validation Checklist

- $\sum_i c_i = C$ (all commitments reconciled against Escrow deposits)
- Token buckets sum to the declared launch allocation ($T$ for Design 1's purchase+liquidity, $T$ split 80/20 for Design 2)
- Engagement Score ranking is finalized and immutable before Step 3 swaps begin
- Escrow Wallet signing authority is verified as revoked on-chain after LP seeding

---

## Chapter 6: Extensions and Open Questions

### 6.1 Hybrid Designs

A hybrid could reserve a small $T_{engage}$-style bucket (Design 1) on top of a swap-based discount curve (Design 2), giving a smooth curve with a guaranteed floor discount for all participants regardless of rank.

### 6.2 Fee Sensitivity

Design 2's formulas ignore the 0.3% LP swap fee. A refinement would fold the fee into $p_{swap}(s)$, slightly compressing the discount range for later (less-engaged) participants.

### 6.3 Sybil and Engagement-Score Robustness

Both designs assume the Engagement Score itself is resistant to gaming; this document does not specify the scoring methodology, which is treated as an external input finalized before the Allocation Period begins.

---

## Appendix: Notation Reference

| Symbol | Meaning |
|---|---|
| $C$ | Total Pi committed by participants |
| $T$ | Total ecosystem-token launch allocation |
| $p_{list}$ | Listing price (Pi per token) |
| $p_{init}$ | Initial LP spot price (Design 2) |
| $p_{swap}(s)$ | Marginal swap price at cumulative swap volume $s$ (Design 2) |
| $p_{eff,i}$ / $p_{eff}(s)$ | Participant's effective acquisition price |
| $k$ | Constant-product invariant of the LP |
| $T_{purchase}, T_{liquidity}, T_{engage}$ | Token buckets in Design 1 |
| $t_i^{base}, t_i^{engage}$ | Base and bonus token allocation, Design 1 |
| $S_{top}, S_{mid}, S_{bottom}$ | Engagement-tier participant sets, Design 1 |

---

**Document Version**: v1.0
**Status**: Draft — companion body document for `4-allocation design 1.md` and `4-allocation design 2.md`
**Language**: English
**Related files**: [`4-allocation design 1.md`](./4-allocation%20design%201.md), [`4-allocation design 2.md`](./4-allocation%20design%202.md), [`pirc_allocation_design2.json`](./pirc_allocation_design2.json)
**Next**: [`5-tge-state`](../5-tge-state/)