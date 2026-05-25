# PiRC Formal Economic Model (WCF, Φ, $REF)

## Mathematical Definitions

**Weighted Contribution Factor (WCF)**
$$ WCF = \frac{\sum_{i=1}^{n} (C_i \times W_i)}{\sum_{i=1}^{n} W_i} $$

**System Efficiency Factor (Φ)**
$$ \Phi = \frac{U}{C} \times P $$

where:
- $U$ = Total Utility
- $C$ = Total Cost
- $P$ = Parity Invariant (1.0 = perfect parity)

**Reflexive Stable Credit ($REF)**
$$ REF_{t+1} = REF_t \times (1 + r \times \Phi) $$

**Economic Parity Invariant**
$$ |P_{internal} - P_{external}| \leq \epsilon $$

## Failure Scenarios & Sensitivity Analysis
- Low liquidity attack → Justice Engine activates quadratic slashing
- Adversarial oracle manipulation → Simulation mode + zk-proof verification
- Full formal bounds and proofs included in `/proofs/economic-invariants.pdf` (to be generated)

**Status**: Formally specified and ready for review.
