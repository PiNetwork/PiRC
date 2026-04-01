import random
from dataclasses import dataclass

@dataclass
class EconomyState:

    pioneers: int
    apps: int
    transactions: int
    circulating_pi: float
    price: float


class GlobalPiEconomySimulator:

    def __init__(self):

        self.state = EconomyState(
            pioneers=17000000,
            apps=200,
            transactions=1000000,
            circulating_pi=2000000000,
            price=0.5
        )

    def simulate_growth(self):

        new_users = int(self.state.pioneers * random.uniform(0.01, 0.05))
        new_apps = int(self.state.apps * random.uniform(0.02, 0.1))

        self.state.pioneers += new_users
        self.state.apps += new_apps

    def simulate_activity(self):

        self.state.transactions = int(
            self.state.pioneers *
            random.uniform(0.05, 0.3)
        )

    def price_model(self):

        demand = self.state.transactions * 0.00001
        supply = self.state.circulating_pi

        self.state.price = demand / supply * 100000

    def run_year(self):

        self.simulate_growth()
        self.simulate_activity()
        self.price_model()

    def summary(self):

        return vars(self.state)


if __name__ == "__main__":

    sim = GlobalPiEconomySimulator()

    for year in range(10):

        sim.run_year()

        print("YEAR", year)
        print(sim.summary())
