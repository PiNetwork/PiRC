import random


class EconomyState:

    def __init__(self):

        self.liquidity = 50
        self.volume = 500
        self.price = 1
        self.supply = 1000


class AutonomousEconomy:

    def __init__(self):

        self.state = EconomyState()

    def simulate_market(self):

        self.state.price += random.uniform(-0.05,0.05)

        self.state.volume += random.uniform(-50,50)

        self.state.liquidity += random.uniform(-5,5)

    def reward_policy(self):

        if self.state.volume > 700:

            self.state.supply += 5

        else:

            self.state.supply += 2

    def liquidity_policy(self):

        if self.state.liquidity < 40:

            self.state.liquidity += 10

    def stabilize_price(self):

        if self.state.price > 1.5:

            self.state.supply += 10

        elif self.state.price < 0.8:

            self.state.supply -= 5

    def step(self):

        self.simulate_market()

        self.reward_policy()

        self.liquidity_policy()

        self.stabilize_price()

        return {
            "price": self.state.price,
            "liquidity": self.state.liquidity,
            "volume": self.state.volume,
            "supply": self.state.supply
        }


if __name__ == "__main__":

    eco = AutonomousEconomy()

    for i in range(20):

        print(eco.step())
