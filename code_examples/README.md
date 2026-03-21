# Pi Hybrid Token Model Examples

This package provides example code for:

- Token allocation from project profits
- Reserve redistribution logic
- Dynamic reward calculation based on verified Pi Base transactions
- Penalties & slashing mechanism for developers/participants

## Installation

```bash
pip install pi_hybrid_examples
from pi_hybrid_examples import token_allocation, reserve_redistribution, base_linked_pi_example

# -------------------------------
# 1️⃣ Allocate profit to different categories
# -------------------------------
total_profit = 1000000  # Pi Base units
liquidity, developers, reserve = token_allocation.allocate_profit(total_profit)
print("Liquidity:", liquidity)
print("Developers:", developers)
print("Reserve:", reserve)

# -------------------------------
# 2️⃣ Redistribute reserve gradually
# -------------------------------
reserve_amount = 150000
liquidity, developers, reserve_amount = reserve_redistribution.redistribute_reserve(
    reserve_amount, liquidity, developers
)
print("After redistribution -> Liquidity:", liquidity, "Developers:", developers, "Reserve:", reserve_amount)

# -------------------------------
# 3️⃣ Base-Linked Pi + Verified Transactions
# -------------------------------
# Example: register participant, record verified transactions, update rewards, apply penalties
base_linked_pi_example.run_example()
