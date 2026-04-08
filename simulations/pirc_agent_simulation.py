import random

class Agent:

    def __init__(self, id):

        self.id = id
        self.liquidity = random.uniform(10,1000)
        self.activity = random.uniform(0,1)
        self.rewards = 0


agents = []

for i in range(1000):
    agents.append(Agent(i))


fee_pool = 50000


total_weight = 0

for a in agents:
    weight = a.liquidity * (1 + a.activity)
    total_weight += weight


for a in agents:

    weight = a.liquidity * (1 + a.activity)

    a.rewards = fee_pool * (weight / total_weight)


total_rewards = sum(a.rewards for a in agents)

avg_reward = total_rewards / len(agents)

top = max(a.rewards for a in agents)

low = min(a.rewards for a in agents)


print("Agents:", len(agents))
print("Total rewards:", int(total_rewards))
print("Average reward:", int(avg_reward))
print("Top reward:", int(top))
print("Lowest reward:", int(low))
