import numpy as np
import random


class LiquidityPool:

    def __init__(self):

        self.pi_reserve = 10000
        self.usd_reserve = 10000
        self.fee = 0.003


    def price(self):

        return self.usd_reserve / self.pi_reserve


    def liquidity_depth(self):

        return np.sqrt(self.pi_reserve * self.usd_reserve)


class DexLiquidityAI:

    def __init__(self):

        self.target_liquidity = 15000
        self.target_volume = 1000


    def evaluate(self, pool, volume):

        liquidity = pool.liquidity_depth()

        liquidity_gap = self.target_liquidity - liquidity
        volume_gap = self.target_volume - volume

        return liquidity_gap, volume_gap


    def adjust_liquidity(self, pool, volume):

        liquidity_gap, volume_gap = self.evaluate(pool, volume)

        injection = 0

        if liquidity_gap > 1000:

            injection = random.uniform(500,1500)

            pool.pi_reserve += injection
            pool.usd_reserve += injection

        return injection


    def adjust_fee(self, pool, volume):

        if volume > self.target_volume * 1.5:

            pool.fee = min(pool.fee + 0.0005, 0.01)

        elif volume < self.target_volume * 0.5:

            pool.fee = max(pool.fee - 0.0005, 0.001)

        return pool.fee


    def rebalance_pool(self, pool):

        price = pool.price()

        target_price = 1

        deviation = target_price - price

        adjust = deviation * 100

        pool.pi_reserve -= adjust
        pool.usd_reserve += adjust

        return adjust


class DexSimulation:

    def __init__(self):

        self.pool = LiquidityPool()
        self.ai = DexLiquidityAI()

    def step(self):

        volume = random.uniform(200,2000)

        injection = self.ai.adjust_liquidity(self.pool, volume)

        fee = self.ai.adjust_fee(self.pool, volume)

        rebalance = self.ai.rebalance_pool(self.pool)

        price = self.pool.price()

        return {
            "volume": volume,
            "liquidity": self.pool.liquidity_depth(),
            "price": price,
            "fee": fee,
            "liquidity_injection": injection,
            "rebalance": rebalance
        }


def run_simulation():

    sim = DexSimulation()

    results = []

    for i in range(200):

        results.append(sim.step())

    return results


if __name__ == "__main__":

    data = run_simulation()

    for d in data[:10]:

        print(d)
