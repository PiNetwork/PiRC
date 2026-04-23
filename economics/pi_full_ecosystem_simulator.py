"""
Pi Full Ecosystem Simulator

Simulates long-term Pi Network economy:
- user growth
- app ecosystem expansion
- token liquidity
- human task economy
- price discovery

Designed for research / macro modeling.
"""

import random
from dataclasses import dataclass


# -----------------------------
# State Objects
# -----------------------------

@dataclass
class NetworkState:

    year: int
    pioneers: int
    apps: int
    transactions: int

    circulating_pi: float
    locked_pi: float

    dex_liquidity: float
    human_task_rewards: float

    price: float


# -----------------------------
# Simulator
# -----------------------------

class PiFullEcosystemSimulator:

    def __init__(self):

        self.state = NetworkState(

            year=0,

            pioneers=17_700_000,
            apps=300,
            transactions=2_000_000,

            circulating_pi=3_000_000_000,
            locked_pi=7_000_000_000,

            dex_liquidity=100_000_000,
            human_task_rewards=0,

            price=0.5
        )

    # -------------------------
    # Network Growth
    # -------------------------

    def simulate_user_growth(self):

        growth_rate = random.uniform(0.03, 0.12)

        new_users = int(self.state.pioneers * growth_rate)

        self.state.pioneers += new_users


    # -------------------------
    # App Ecosystem Growth
    # -------------------------

    def simulate_app_growth(self):

        growth = int(self.state.apps * random.uniform(0.05, 0.25))

        self.state.apps += growth


    # -------------------------
    # Activity
    # -------------------------

    def simulate_transactions(self):

        tx_per_user = random.uniform(0.1, 0.6)

        self.state.transactions = int(
            self.state.pioneers * tx_per_user
        )


    # -------------------------
    # Human Task Economy
    # -------------------------

    def simulate_human_tasks(self):

        tasks = int(self.state.pioneers * random.uniform(0.01, 0.05))

        reward = tasks * random.uniform(0.02, 0.08)

        self.state.human_task_rewards += reward

        self.state.circulating_pi += reward


    # -------------------------
    # DEX Liquidity
    # -------------------------

    def simulate_dex_liquidity(self):

        new_liquidity = self.state.transactions * random.uniform(0.001, 0.01)

        self.state.dex_liquidity += new_liquidity


    # -------------------------
    # Token Locking
    # -------------------------

    def simulate_token_locking(self):

        lock_rate = random.uniform(0.01, 0.04)

        locked = self.state.circulating_pi * lock_rate

        self.state.circulating_pi -= locked
        self.state.locked_pi += locked


    # -------------------------
    # Price Model
    # -------------------------

    def price_discovery(self):

        demand = (
            self.state.transactions * 0.00005 +
            self.state.dex_liquidity * 0.000002 +
            self.state.apps * 0.01
        )

        supply = self.state.circulating_pi

        new_price = demand / supply * 100000

        self.state.price = max(new_price, 0.01)


    # -------------------------
    # Year Simulation
    # -------------------------

    def run_year(self):

        self.state.year += 1

        self.simulate_user_growth()
        self.simulate_app_growth()
        self.simulate_transactions()
        self.simulate_human_tasks()
        self.simulate_dex_liquidity()
        self.simulate_token_locking()
        self.price_discovery()


    # -------------------------
    # Summary
    # -------------------------

    def summary(self):

        return {
            "year": self.state.year,
            "pioneers": self.state.pioneers,
            "apps": self.state.apps,
            "transactions": self.state.transactions,
            "circulating_pi": round(self.state.circulating_pi, 2),
            "locked_pi": round(self.state.locked_pi, 2),
            "dex_liquidity": round(self.state.dex_liquidity, 2),
            "price_estimate": round(self.state.price, 4)
        }


# -----------------------------
# Run Simulation
# -----------------------------

if __name__ == "__main__":

    sim = PiFullEcosystemSimulator()

    YEARS = 50

    for _ in range(YEARS):

        sim.run_year()

        print(sim.summary())
