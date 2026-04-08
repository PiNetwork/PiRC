import random

class Agent:

    def __init__(self, liquidity):
        self.liquidity = liquidity
        self.rewards = 0

agents = [Agent(random.randint(10,100)) for _ in range(200)]

fee_pool = 5000

total_liquidity = sum(a.liquidity for a in agents)

for a in agents:
    a.rewards = fee_pool * (a.liquidity / total_liquidity)

avg = sum(a.rewards for a in agents)/len(agents)

print("Average reward:", avg)
