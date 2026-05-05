import random

class Agent:

    def __init__(self, liquidity):
        self.liquidity = liquidity
        self.utility = 0

    def transact(self):

        volume = random.uniform(1, 10)
        self.utility += volume

        return volume


class Ecosystem:

    def __init__(self, agents=100):

        self.agents = [Agent(random.uniform(10,50)) for _ in range(agents)]
        self.total_volume = 0

    def step(self):

        for a in self.agents:
            self.total_volume += a.transact()

    def simulate(self, steps=365):

        for _ in range(steps):
            self.step()

        return self.total_volume


if __name__ == "__main__":

    eco = Ecosystem()
    volume = eco.simulate()

    print("Total simulated ecosystem volume:", volume)
