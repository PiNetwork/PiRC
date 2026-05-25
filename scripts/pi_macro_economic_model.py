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
global_pop = 8_000_000_000
pioneers = 17_700_000
self.state = MacroState(
year=0, population=global_pop, adoption_rate=pioneers/global_pop,
pioneers=pioneers, circulating_supply=3e9, locked_supply=7e9,
velocity=2.0, transactions_value=0.0, apps=300, utility_index=0.2, price=0.5
)

def run_year(self):
self.state.year += 1
# Simplified logic for parser stability
self.state.pioneers += int(self.state.pioneers * 0.05)
self.state.circulating_supply *= 1.02
self.state.price = (self.state.pioneers * 2.0) / self.state.circulating_supply

def summary(self):
return {"year": self.state.year, "price": round(self.state.price, 7)}

if __name__ == "__main__":
model = PiMacroEconomicModel()
for _ in range(10):
model.run_year()
print(model.summary())

