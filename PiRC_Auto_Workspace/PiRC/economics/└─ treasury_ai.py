import numpy as np
import random


class Treasury:

    def __init__(self):

        self.pi_reserve = 100000
        self.stable_reserve = 50000
        self.liquidity_fund = 20000


class TreasuryInvestmentAI:

    def __init__(self):

        self.target_liquidity = 15000
        self.target_reserve_ratio = 0.5

    def allocate(self, treasury, market_price):

        decisions = {}

        # liquidity support
        if treasury.liquidity_fund < self.target_liquidity:

            add = random.uniform(1000,5000)

            treasury.liquidity_fund += add
            treasury.pi_reserve -= add

            decisions["liquidity_support"] = add

        # rebalance reserves
        reserve_ratio = treasury.pi_reserve / (treasury.pi_reserve + treasury.stable_reserve)

        if reserve_ratio > self.target_reserve_ratio:

            convert = random.uniform(2000,5000)

            treasury.pi_reserve -= convert
            treasury.stable_reserve += convert

            decisions["diversification"] = convert

        return decisions


class TreasurySimulation:

    def __init__(self):

        self.treasury = Treasury()
        self.ai = TreasuryInvestmentAI()

    def step(self):

        price = random.uniform(0.5,2)

        actions = self.ai.allocate(self.treasury, price)

        return {
            "price": price,
            "pi_reserve": self.treasury.pi_reserve,
            "stable_reserve": self.treasury.stable_reserve,
            "liquidity_fund": self.treasury.liquidity_fund,
            "actions": actions
        }


if __name__ == "__main__":

    sim = TreasurySimulation()

    for i in range(10):
        print(sim.step())
