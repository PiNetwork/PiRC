import random

import pandas as pd

def load_users():
    df = pd.read_csv("data/users.csv")
    return df.to_dict("records")


class User:
    def __init__(self, id, is_sybil=False):
        self.id = id
        self.is_sybil = is_sybil
        
        # Attributes
        self.kyc = 1 if not is_sybil else random.uniform(0, 0.3)
        self.activity = random.uniform(0.5, 1.0) if not is_sybil else random.uniform(0.1, 0.4)
        self.reputation = random.uniform(0.5, 1.0) if not is_sybil else random.uniform(0.1, 0.3)
        self.stake = random.uniform(0.5, 1.0) if not is_sybil else random.uniform(0.0, 0.2)

        self.trust = 0
        self.reward = 0

    def calculate_trust(self, w):
        self.trust = (
            w["kyc"] * self.kyc +
            w["activity"] * self.activity +
            w["reputation"] * self.reputation +
            w["stake"] * self.stake
        )

class ATASSimulation:
    def __init__(self, num_users=100, sybil_ratio=0.3):
        self.users = []
        self.weights = {
            "kyc": 0.4,
            "activity": 0.2,
            "reputation": 0.2,
            "stake": 0.2
        }

        for i in range(num_users):
            is_sybil = random.random() < sybil_ratio
            self.users.append(User(i, is_sybil))

    def run(self, total_reward=1000):
        # Calculate trust
        for user in self.users:
            user.calculate_trust(self.weights)

        total_trust = sum(u.trust for u in self.users)

        # Distribute rewards
        for user in self.users:
            user.reward = total_reward * (user.trust / total_trust)

    def summary(self):
        real_users = [u for u in self.users if not u.is_sybil]
        sybil_users = [u for u in self.users if u.is_sybil]

        real_reward = sum(u.reward for u in real_users)
        sybil_reward = sum(u.reward for u in sybil_users)

        return {
            "real_users": len(real_users),
            "sybil_users": len(sybil_users),
            "real_reward": real_reward,
            "sybil_reward": sybil_reward,
            "sybil_percentage": sybil_reward / (real_reward + sybil_reward)
        }


if __name__ == "__main__":
    sim = ATASSimulation(num_users=200, sybil_ratio=0.4)
    sim.run()

    result = sim.summary()

    print("=== ATAS Simulation Result ===")
    print(result)
