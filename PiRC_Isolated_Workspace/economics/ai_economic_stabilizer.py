import numpy as np

class EconomicStabilizer:

    def __init__(self):
        self.target_liquidity = 50
        self.reward_multiplier = 1.0

    def update(self, liquidity, transaction_volume):

        if liquidity < self.target_liquidity:
            self.reward_multiplier *= 1.05

        elif liquidity > self.target_liquidity * 1.5:
            self.reward_multiplier *= 0.95

        if transaction_volume > 1000:
            self.reward_multiplier *= 0.98

        return self.reward_multiplier


def simulate():

    stabilizer = EconomicStabilizer()

    liquidity_levels = np.random.normal(50, 10, 100)
    volumes = np.random.normal(800, 200, 100)

    multipliers = []

    for l, v in zip(liquidity_levels, volumes):
        multipliers.append(stabilizer.update(l, v))

    return multipliers


if __name__ == "__main__":
    results = simulate()
    print("Simulation multipliers:", results[:10])
