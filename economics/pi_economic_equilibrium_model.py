"""
Pi Economic Equilibrium Model

Research-grade economic equilibrium calculator for a utility blockchain.

Model components:
- supply vs demand
- velocity of money
- network effect
- liquidity multiplier
- utility demand from applications

Inspired by macro monetary equation:
MV = PQ

Where:
M = money supply
V = velocity
P = price
Q = real transaction output
"""

from dataclasses import dataclass
import math
import random


# --------------------------------------
# State
# --------------------------------------

@dataclass
class EconomicState:

    pioneers: int
    apps: int

    circulating_supply: float
    locked_supply: float

    liquidity: float

    velocity: float

    transaction_volume: float

    price: float


# --------------------------------------
# Model
# --------------------------------------

class PiEconomicEquilibriumModel:

    def __init__(self):

        self.state = EconomicState(

            pioneers=17_700_000,
            apps=300,

            circulating_supply=3_000_000_000,
            locked_supply=7_000_000_000,

            liquidity=100_000_000,

            velocity=2.0,

            transaction_volume=0,

            price=0.5
        )


    # ----------------------------------
    # Utility demand
    # ----------------------------------

    def utility_demand(self):

        app_factor = math.log(self.state.apps + 1)

        user_factor = math.log(self.state.pioneers)

        demand = app_factor * user_factor * 100000

        return demand


    # ----------------------------------
    # Network effect
    # ----------------------------------

    def network_effect(self):

        # Metcalfe-style scaling

        users = self.state.pioneers

        effect = math.sqrt(users)

        return effect


    # ----------------------------------
    # Velocity update
    # ----------------------------------

    def update_velocity(self):

        utility = self.utility_demand()

        self.state.velocity = 1 + utility / 1_000_000


    # ----------------------------------
    # Transaction volume
    # ----------------------------------

    def update_transactions(self):

        demand = self.utility_demand()

        self.state.transaction_volume = demand * self.state.velocity


    # ----------------------------------
    # Liquidity multiplier
    # ----------------------------------

    def liquidity_multiplier(self):

        liquidity_ratio = self.state.liquidity / self.state.circulating_supply

        multiplier = 1 + liquidity_ratio * 5

        return multiplier


    # ----------------------------------
    # Equilibrium price
    # ----------------------------------

    def compute_equilibrium_price(self):

        self.update_velocity()

        self.update_transactions()

        demand = self.state.transaction_volume

        supply = self.state.circulating_supply

        base_price = demand / supply

        network_multiplier = self.network_effect() / 1000

        liquidity_multiplier = self.liquidity_multiplier()

        price = base_price * network_multiplier * liquidity_multiplier

        self.state.price = price

        return price


    # ----------------------------------
    # Growth simulation
    # ----------------------------------

    def simulate_growth(self):

        new_users = int(self.state.pioneers * random.uniform(0.03, 0.12))

        self.state.pioneers += new_users

        new_apps = int(self.state.apps * random.uniform(0.05, 0.20))

        self.state.apps += new_apps

        liquidity_growth = self.state.liquidity * random.uniform(0.02, 0.10)

        self.state.liquidity += liquidity_growth


    # ----------------------------------
    # Year step
    # ----------------------------------

    def run_year(self):

        self.simulate_growth()

        price = self.compute_equilibrium_price()

        return {

            "pioneers": self.state.pioneers,
            "apps": self.state.apps,
            "velocity": round(self.state.velocity, 3),
            "transaction_volume": round(self.state.transaction_volume, 2),
            "liquidity": round(self.state.liquidity, 2),
            "price_equilibrium": round(price, 4)
        }


# --------------------------------------
# Run Simulation
# --------------------------------------

if __name__ == "__main__":

    model = PiEconomicEquilibriumModel()

    YEARS = 30

    for year in range(YEARS):

        result = model.run_year()

        print("Year", year + 1, result)
