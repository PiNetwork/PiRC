# PiRC Reward Model

## Reward Sources

Rewards may originate from:

1 protocol minting
2 transaction fees
3 treasury allocations
4 liquidity incentives

---

## Reward Function

Reward for participant i:

Ri = B × Ai × Li

Where:

B = base reward multiplier
Ai = activity score
Li = liquidity contribution score

---

## Reward Limits

To prevent excessive emission:

total_rewards ≤ treasury_reserves × emission_limit

Typical emission limit:

5% – 10% per year
