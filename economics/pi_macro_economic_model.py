"""
Pi Macro Economic Model - Justice Engine Edition
Compliance: PiRC1-260 Standard (10^-7 Precision)
"""

import random
from dataclasses import dataclass

@dataclass
class MacroState:
year: int
population: int
adoption_rate: float
pioneers: int
circulating_supply: float
locked_supply: float
velocity: float
transactions_value: float
apps: int
utility_index: float
price: float

class PiMacroEconomicModel:
def __init__(self):
# Constants aligned with global Pi population data
global_population = 8_000_000_000
pioneers = 17_700_000 # Base starting point

self.state = MacroState(
year=0,
population=global_population,
adoption_rate=pioneers / global_population,
pioneers=pioneers,
circulating_supply=3_000_000_000.0,
locked_supply=7_000_000_000.0,
velocity=2.0,
transactions_value=0.0,
apps=300,
utility_index=0.2,
price=0.5 # Initial base value
)

def simulate_adoption(self):
growth = random.uniform(0.02, 0.10)
new_users = int(self.state.pioneers * growth)
self.state.pioneers += new_users
self.state.adoption_rate = self.state.pioneers / self.state.population

def simulate_apps(self):
growth = int(self.state.apps * random.uniform(0.05, 0.20))
self.state.apps += growth
self.state.utility_index = min(1.0, self.state.apps / 10000)

def simulate_supply(self):
# PiRC-260: Supply dynamics with 10^-7 precision
inflation = random.uniform(0.01, 0.03)
minted = self.state.circulating_supply * inflation
self.state.circulating_supply += minted

lock_ratio = random.uniform(0.01, 0.05)
locked = self.state.circulating_supply * lock_ratio
self.state.circulating_supply -= locked
self.state.locked_supply += locked

def simulate_velocity(self):
activity_factor = self.state.utility_index * 5
self.state.velocity = 1 + activity_factor

def simulate_transactions(self):
avg_payment = random.uniform(0.5, 5)
self.state.transactions_value = (
self.state.pioneers *
avg_payment *
self.state.velocity
)

def equilibrium_price(self):
demand = self.state.transactions_value
supply = self.state.circulating_supply
# Protection against division by zero
if supply == 0: return 0

equilibrium = demand / supply
network_effect = 1 + (self.state.adoption_rate * 20)
self.state.price = equilibrium * network_effect

def run_year(self):
self.state.year += 1
self.simulate_adoption()
self.simulate_apps()
self.simulate_supply()
self.simulate_velocity()
self.simulate_transactions()
self.equilibrium_price()

def summary(self):
# Precision enforced at 7 decimal places for Justice Engine compliance
return {
"year": self.state.year,
"pioneers": self.state.pioneers,
"adoption_rate": round(self.state.adoption_rate, 7),
"apps": self.state.apps,
"velocity": round(self.state.velocity, 4),
"circulating_supply": round(self.state.circulating_supply, 7),
"locked_supply": round(self.state.locked_supply, 7),
"transaction_value": round(self.state.transactions_value, 7),
"price_estimate": round(self.state.price, 7)
}

if __name__ == "__main__":
model = PiMacroEconomicModel()
YEARS = 50
for _ in range(YEARS):
model.run_year()
print(model.summary())

