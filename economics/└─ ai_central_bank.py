import numpy as np
import random


class EconomicState:

    def __init__(self):

        self.liquidity = 50
        self.volume = 500
        self.supply = 1000
        self.reward_multiplier = 1.0


class AICentralBank:

    def __init__(self):

        self.target_liquidity = 60
        self.target_volume = 800
        self.target_supply_growth = 5

    def evaluate(self, state):

        liquidity_gap = self.target_liquidity - state.liquidity
        volume_gap = self.target_volume - state.volume

        return liquidity_gap, volume_gap


    def monetary_policy(self, state):

        liquidity_gap, volume_gap = self.evaluate(state)

        if liquidity_gap > 10:
            state.reward_multiplier *= 1.05

        elif liquidity_gap < -10:
            state.reward_multiplier *= 0.95

        if volume_gap > 100:
            state.reward_multiplier *= 1.02

        return state.reward_multiplier


    def liquidity_policy(self, state):

        injection = 0

        if state.liquidity < self.target_liquidity:

            injection = random.uniform(5,15)
            state.liquidity += injection

        return injection


    def treasury_policy(self, state):

        burn = 0

        if state.supply > 1500:

            burn = random.uniform(10,30)
            state.supply -= burn

        return burn


class EconomySimulator:

    def __init__(self):

        self.state = EconomicState()
        self.bank = AICentralBank()

    def step(self):

        reward_multiplier = self.bank.monetary_policy(self.state)

        liquidity_injection = self.bank.liquidity_policy(self.state)

        burn = self.bank.treasury_policy(self.state)

        liquidity_change = np.random.normal(reward_multiplier*2, 3)
        volume_change = np.random.normal(reward_multiplier*10, 20)

        self.state.liquidity += liquidity_change
        self.state.volume += volume_change

        self.state.supply += reward_multiplier*2

        return {
            "liquidity": self.state.liquidity,
            "volume": self.state.volume,
            "supply": self.state.supply,
            "reward_multiplier": reward_multiplier,
            "liquidity_injection": liquidity_injection,
            "burn": burn
        }


def run_simulation():

    sim = EconomySimulator()

    history = []

    for i in range(200):

        metrics = sim.step()
        history.append(metrics)

    return history


if __name__ == "__main__":

    results = run_simulation()

    for r in results[:10]:
        print(r)
