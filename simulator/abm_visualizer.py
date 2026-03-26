import random
import matplotlib.pyplot as plt

class Agent:
    def __init__(self, behavior_type):
        self.type = behavior_type
        self.pi_balance = random.uniform(100, 5000)
        self.ref_balance = 0

    def decide_action(self, phi, liquidity_trend):
        if self.type == "Opportunistic":
            return "MINT_MAX" if 0.5 < phi < 0.9 else "HOLD"
        elif self.type == "Defensive":
            return "EXIT_ALL" if liquidity_trend == "DOWN" or phi < 0.4 else "HOLD"
        elif self.type == "Steady":
            return "MINT_PARTIAL"

class PiRC101_Visual_Sim:
    def __init__(self, num_agents=200):
        self.epoch = 0
        self.pi_price = 0.314
        self.liquidity = 10_000_000
        self.ref_supply = 0
        self.qwf = 10_000_000
        self.gamma = 1.5
        self.exit_cap = 0.001
        self.agents = [Agent(random.choice(["Opportunistic", "Defensive", "Steady"])) for _ in range(num_agents)]
        
        # Data trackers for plotting
        self.history = {'epoch': [], 'phi': [], 'liquidity': [], 'ref_supply': []}

    def get_phi(self):
        if self.ref_supply == 0: return 1.0
        ratio = (self.liquidity * self.exit_cap) / (self.ref_supply / self.qwf)
        return 1.0 if ratio >= self.gamma else (ratio / self.gamma) ** 2

    def run_epoch(self):
        self.epoch += 1
        
        # Simulate a prolonged bear market (Stress Test)
        market_shift = random.uniform(-0.05, 0.02) 
        self.pi_price *= (1 + market_shift)
        self.liquidity *= (1 + market_shift)
        liquidity_trend = "DOWN" if market_shift < 0 else "UP"

        phi = self.get_phi()
        daily_exit_pool = self.liquidity * self.exit_cap
        exit_requests = 0

        for agent in self.agents:
            action = agent.decide_action(phi, liquidity_trend)
            if action == "MINT_MAX" and agent.pi_balance > 0:
                minted = agent.pi_balance * self.pi_price * self.qwf * phi
                self.ref_supply += minted
                agent.ref_balance += minted
                agent.pi_balance = 0
            elif action == "MINT_PARTIAL" and agent.pi_balance > 10:
                minted = 10 * self.pi_price * self.qwf * phi
                self.ref_supply += minted
                agent.ref_balance += minted
                agent.pi_balance -= 10
            elif action == "EXIT_ALL" and agent.ref_balance > 0:
                exit_requests += agent.ref_balance

        exit_cleared = min(exit_requests, daily_exit_pool * self.qwf)
        self.ref_supply -= exit_cleared
        
        if self.ref_supply < 0: self.ref_supply = 0

        # Save data for plotting
        self.history['epoch'].append(self.epoch)
        self.history['phi'].append(phi)
        self.history['liquidity'].append(self.liquidity)
        self.history['ref_supply'].append(self.ref_supply)

# Run Simulation
sim = PiRC101_Visual_Sim(num_agents=200)
for _ in range(100):  # Run for 100 days
    sim.run_epoch()

# --- Plotting the Results ---
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

# Plot 1: System Solvency (Phi) over Time
ax1.plot(sim.history['epoch'], sim.history['phi'], color='red', linewidth=2, label='Phi (Throttling Coefficient)')
ax1.axhline(y=1.0, color='green', linestyle='--', label='Full Expansion (1.0)')
ax1.set_title('PiRC-101 Guardrail: Phi Reaction to 100-Day Market Stress')
ax1.set_ylabel('Phi Value')
ax1.legend()
ax1.grid(True)

# Plot 2: Liquidity vs REF Supply
ax2.plot(sim.history['epoch'], sim.history['liquidity'], color='blue', label='External Liquidity (USD)')
ax2.set_ylabel('Liquidity (USD)', color='blue')
ax2.tick_params(axis='y', labelcolor='blue')

ax3 = ax2.twinx()
ax3.plot(sim.history['epoch'], sim.history['ref_supply'], color='purple', linestyle='-', label='Total REF Supply')
ax3.set_ylabel('REF Supply', color='purple')
ax3.tick_params(axis='y', labelcolor='purple')

ax2.set_title('Macroeconomic Trends: Liquidity Depletion vs Credit Supply')
ax2.set_xlabel('Epoch (Days)')
ax2.grid(True)

plt.tight_layout()
plt.savefig('pirc101_stress_test_chart.png')
plt.show()
print("Simulation complete! Chart saved as 'pirc101_stress_test_chart.png'")
