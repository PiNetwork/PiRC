"""
Pi Tokenomics Engine

Simulates long-term tokenomics dynamics:
- mining rate decay
- reward distribution
- validator economy
- staking / locking
- circulating supply evolution
"""

import random
from dataclasses import dataclass


# --------------------------------
# State
# --------------------------------

@dataclass
class TokenomicsState:

    year: int

    pioneers: int
    miners: int

    mining_rate: float
    mined_supply: float

    circulating_supply: float
    locked_supply: float

    staking_ratio: float
    validator_count: int

    validator_rewards: float
    staking_rewards: float


# --------------------------------
# Engine
# --------------------------------

class PiTokenomicsEngine:

    def __init__(self):

        pioneers = 17_700_000

        self.state = TokenomicsState(

            year=0,

            pioneers=pioneers,
            miners=int(pioneers * 0.6),

            mining_rate=0.02,
            mined_supply=0,

            circulating_supply=3_000_000_000,
            locked_supply=7_000_000_000,

            staking_ratio=0.1,
            validator_count=1_000_000,

            validator_rewards=0,
            staking_rewards=0
        )


    # -----------------------------
    # Mining
    # -----------------------------

    def simulate_mining(self):

        mined = self.state.miners * self.state.mining_rate

        self.state.mined_supply += mined
        self.state.circulating_supply += mined


    # -----------------------------
    # Mining rate decay
    # -----------------------------

    def mining_decay(self):

        decay_factor = random.uniform(0.85, 0.95)

        self.state.mining_rate *= decay_factor


    # -----------------------------
    # Staking
    # -----------------------------

    def simulate_staking(self):

        stake = self.state.circulating_supply * self.state.staking_ratio

        self.state.circulating_supply -= stake
        self.state.locked_supply += stake


    # -----------------------------
    # Validator economy
    # -----------------------------

    def simulate_validators(self):

        reward_pool = self.state.circulating_supply * 0.005

        per_validator = reward_pool / self.state.validator_count

        self.state.validator_rewards = per_validator

        self.state.circulating_supply -= reward_pool


    # -----------------------------
    # Staking rewards
    # -----------------------------

    def distribute_staking_rewards(self):

        rewards = self.state.locked_supply * 0.02

        self.state.staking_rewards = rewards

        self.state.circulating_supply += rewards


    # -----------------------------
    # Network growth
    # -----------------------------

    def simulate_growth(self):

        growth = int(self.state.pioneers * random.uniform(0.02, 0.08))

        self.state.pioneers += growth

        self.state.miners = int(self.state.pioneers * 0.6)


    # -----------------------------
    # Year step
    # -----------------------------

    def run_year(self):

        self.state.year += 1

        self.simulate_growth()

        self.simulate_mining()

        self.mining_decay()

        self.simulate_staking()

        self.simulate_validators()

        self.distribute_staking_rewards()


    # -----------------------------
    # Summary
    # -----------------------------

    def summary(self):

        return {

            "year": self.state.year,
            "pioneers": self.state.pioneers,
            "miners": self.state.miners,

            "mining_rate": round(self.state.mining_rate, 6),
            "mined_supply": round(self.state.mined_supply, 2),

            "circulating_supply": round(self.state.circulating_supply, 2),
            "locked_supply": round(self.state.locked_supply, 2),

            "validator_reward_per_node": round(self.state.validator_rewards, 6),
            "staking_rewards": round(self.state.staking_rewards, 2)
        }


# --------------------------------
# Run Simulation
# --------------------------------

if __name__ == "__main__":

    engine = PiTokenomicsEngine()

    YEARS = 50

    for _ in range(YEARS):

        engine.run_year()

        print(engine.summary())
