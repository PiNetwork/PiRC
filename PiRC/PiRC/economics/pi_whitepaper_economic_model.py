"""
Pi Whitepaper Economic Model

Unified research model combining:
- network growth
- tokenomics
- liquidity
- utility demand
- macro equilibrium

Designed for long-term simulation (50–100 years).
"""

from dataclasses import dataclass
import random
import math


# --------------------------------------
# State
# --------------------------------------

@dataclass
class WhitepaperState:

    year: int

    pioneers: int
    apps: int

    circulating_supply: float
    locked_supply: float

    liquidity: float

    velocity: float
    transaction_volume: float

    mining_rate: float
    price: float


# --------------------------------------
# Model
# --------------------------------------

class PiWhitepaperEconomicModel:

    def __init__(self):

        self.state = WhitepaperState(

            year=0,

            pioneers=17_700_000,
            apps=300,

            circulating_supply=3_000_000_000,
            locked_supply=7_000_000_000,

            liquidity=100_000_000,

            velocity=2.0,
            transaction_volume=0,

            mining_rate=0.02,

            price=0.5
        )


    # --------------------------------------
    # Network Growth
    # --------------------------------------

    def network_growth(self):

        growth = random.uniform(0.03, 0.10)

        new_users = int(self.state.pioneers * growth)

        self.state.pioneers += new_users


    # --------------------------------------
    # App Ecosystem Growth
    # --------------------------------------

    def app_growth(self):

        growth = int(self.state.apps * random.uniform(0.05, 0.20))

        self.state.apps += growth


    # --------------------------------------
    # Tokenomics
    # --------------------------------------

    def mining(self):

        mined = self.state.pioneers * self.state.mining_rate

        self.state.circulating_supply += mined


    def mining_decay(self):

        self.state.mining_rate *= random.uniform(0.85, 0.95)


    def staking_and_locking(self):

        lock = self.state.circulating_supply * random.uniform(0.01, 0.05)

        self.state.circulating_supply -= lock
        self.state.locked_supply += lock


    # --------------------------------------
    # Utility Demand
    # --------------------------------------

    def utility_demand(self):

        app_factor = math.log(self.state.apps + 1)

        user_factor = math.log(self.state.pioneers)

        return app_factor * user_factor * 100000


    # --------------------------------------
    # Velocity
    # --------------------------------------

    def update_velocity(self):

        demand = self.utility_demand()

        self.state.velocity = 1 + demand / 1_000_000


    # --------------------------------------
    # Transactions
    # --------------------------------------

    def update_transactions(self):

        demand = self.utility_demand()

        self.state.transaction_volume = demand * self.state.velocity


    # --------------------------------------
    # Liquidity
    # --------------------------------------

    def update_liquidity(self):

        new_liquidity = self.state.transaction_volume * random.uniform(0.001, 0.01)

        self.state.liquidity += new_liquidity


    # --------------------------------------
    # Network Effect
    # --------------------------------------

    def network_effect(self):

        return math.sqrt(self.state.pioneers)


    # --------------------------------------
    # Price Discovery
    # --------------------------------------

    def compute_price(self):

        demand = self.state.transaction_volume

        supply = self.state.circulating_supply

        base_price = demand / supply

        network_multiplier = self.network_effect() / 1000

        liquidity_multiplier = 1 + (self.state.liquidity / supply) * 5

        price = base_price * network_multiplier * liquidity_multiplier

        self.state.price = price


    # --------------------------------------
    # Year Step
    # --------------------------------------

    def run_year(self):

        self.state.year += 1

        self.network_growth()

        self.app_growth()

        self.mining()

        self.mining_decay()

        self.staking_and_locking()

        self.update_velocity()

        self.update_transactions()

        self.update_liquidity()

        self.compute_price()


    # --------------------------------------
    # Summary
    # --------------------------------------

    def summary(self):

        return {

            "year": self.state.year,
            "pioneers": self.state.pioneers,
            "apps": self.state.apps,

            "circulating_supply": round(self.state.circulating_supply, 2),
            "locked_supply": round(self.state.locked_supply, 2),

            "velocity": round(self.state.velocity, 3),
            "transaction_volume": round(self.state.transaction_volume, 2),

            "liquidity": round(self.state.liquidity, 2),

            "price_estimate": round(self.state.price, 4)
        }


# --------------------------------------
# Run Simulation
# --------------------------------------

if __name__ == "__main__":

    model = PiWhitepaperEconomicModel()

    YEARS = 100

    for _ in range(YEARS):

        model.run_year()

        print(model.summary())
