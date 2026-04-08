import math
import random
import matplotlib.pyplot as plt

# --- Auditable Agent Class: Formalizing State Tracking ---
class Agent:
    # Update 1:traceability via agent_id and explicit auditable balance initialization
    def __init__(self, agent_id, behavior_type, initial_pi=0):
        self.id = agent_id
        self.type = behavior_type
        
        # Explicit balance management to prevent negative balances
        self.pi_balance = initial_pi if initial_pi > 0 else random.uniform(100, 5000)
        self.ref_balance = 0 # Explicit auditable REF state initialization

    def decide_action(self, phi, liquidity_trend):
        # 1. Opportunistic Minter: Rushes to mint if Phi is dropping but still high enough
        if self.type == "Opportunistic":
            if 0.5 < phi < 0.9: 
                return "MINT_MAX"
            return "HOLD"
            
        # 2. Defensive Exiter: Panics if liquidity trends downward or Phi crashes
        elif self.type == "Defensive":
            if liquidity_trend == "DOWN" or phi < 0.4:
                return "EXIT_ALL"
            return "HOLD"
            
        # 3. Steady Merchant: Mints predictable amounts regardless of conditions
        elif self.type == "Steady":
            return "MINT_PARTIAL"

# --- Hardened PiRC-101 Stochastic ABM Simulator Class ---
# Focus: Simplified script to prioritize the hardened stress test.
class PiRC101_Hardened_Sim:
    def __init__(self, num_agents=200):
        # Genesis State (Epoch 0)
        self.epoch = 0
        self.pi_price = 0.314
        self.liquidity = 10_000_000  # $10M Market Depth
        self.ref_supply = 0
        
        # Protocol Constants
        self.qwf = 10_000_000
        self.gamma = 1.5
        self.exit_cap = 0.001
        
        # Heterogeneous population with explicit state tracking
        self.agents = [Agent(i, random.choice(["Opportunistic", "Defensive", "Steady"])) for i in range(num_agents)]
        
        # Historical trackers for plotting
        self.history = {'epoch': [], 'phi': [], 'liquidity': [], 'ref_supply': []}

    def get_phi(self):
        if self.ref_supply == 0: return 1.0
        available_exit = self.liquidity * self.exit_cap
        # Ratio of total available daily exit USD (Depth * ExitCap) to normalized REF Debt (Supply/QWF).
        ratio = available_exit / (self.ref_supply / self.qwf)
        return 1.0 if ratio >= self.gamma else (ratio / self.gamma) ** 2

    def run_epoch(self):
        self.epoch += 1
        
        # Severe multi-epoch bear market simulation (Stochastic Shock)
        # Random market walk heavily biased towards severe crash (e.g., -15% to +5%).
        market_shift = random.uniform(-0.15, 0.05) 
        self.pi_price *= (1 + market_shift)
        self.liquidity *= (1 + market_shift)
        liquidity_trend = "DOWN" if market_shift < 0 else "UP"

        phi = self.get_phi()
        daily_exit_pool_usd = self.liquidity * self.exit_cap
        exit_requests_ref = 0

        # Auditable Traceability on actions and balances
        for agent in self.agents:
            action = agent.decide_action(phi, liquidity_trend)
            
            if action == "MINT_MAX" and agent.pi_balance > 0:
                minted = agent.pi_balance * self.pi_price * self.qwf * phi
                
                # Deterministic state updates: balance mutation fix
                self.ref_supply += minted
                agent.ref_balance += minted
                agent.pi_balance = 0 # Balance zeroed AFTER minting full amount
                
            elif action == "MINT_PARTIAL" and agent.pi_balance >= 10:
                # Ensure balance accounting is correct before subtraction
                minted = 10 * self.pi_price * self.qwf * phi
                self.ref_supply += minted
                agent.ref_balance += minted
                agent.pi_balance -= 10 # Explicit auditable subtraction
                
            elif action == "EXIT_ALL" and agent.ref_balance > 0:
                exit_requests_ref += agent.ref_balance

        # --- Process Exit Queue (Throttled by Exit Door - USD Based Refactor) ---
        # Allowed REF exit is capped by available daily door (0.1% USD) conceptualized back to REF
        if exit_requests_ref > 0:
            # Full Solvency Check: REF supply is burnt conceptually at the exit point
            if self.ref_supply > 0 and self.pi_price > 0:
                allowed_ref_exit_amount = min(exit_requests_ref, (daily_exit_pool_usd * self.qwf) / self.pi_price)
                self.ref_supply -= allowed_ref_exit_amount
                
        if self.ref_supply < 0: self.ref_supply = 0

        # --- Update 2: Update all historical trackers to fix plotting mismatch ---
        self.history['epoch'].append(self.epoch)
        self.history['phi'].append(phi)
        self.history['liquidity'].append(self.liquidity)
        self.history['ref_supply'].append(self.ref_supply)

# --- Execute Simulation (120-Day Stochastic Stress Test) ---
sim = PiRC101_Hardened_Sim(num_agents=300)
for _ in range(120):
    sim.run_epoch()

# --- Visualization Script using Matplotlib ---
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

# Plot 1: System Health Indicator (Phi)
ax1.plot(sim.history['epoch'], sim.history['phi'], color='red', linewidth=2, label='System Solvency (Phi)')
ax1.axhline(y=1.0, color='green', linestyle='--', label='Optimal Expansion (1.0)')
ax1.set_title('PiRC-101 Guardrail: Reflexive Phi Throttling Under Panicked Agent-Based Behavior')
ax1.set_ylabel('Phi Value (State Machine Guard)')
ax1.legend(loc='lower left')
ax1.grid(True)

# Plot 2: Macroeconomic Trends (Liquidity vs Supply)
ax2.plot(sim.history['epoch'], sim.history['liquidity'], color='blue', label='External AMM Liquidity (USD)')
ax2.set_ylabel('Liquidity Depth (USD)', color='blue')
ax2.tick_params(axis='y', labelcolor='blue')

ax3 = ax2.twinx()
ax3.plot(sim.history['epoch'], sim.history['ref_supply'], color='purple', linestyle='-', label='Internal REF Supply (Credit)')
ax3.set_ylabel('Credit Supply (REF)', color='purple')
ax3.tick_params(axis='y', labelcolor='purple')

ax2.set_title('Protocol Convergence: Liquidity Depletion vs Deterministic Supply Cap')
ax2.set_xlabel('Epoch (Days)')
ax2.grid(True)

plt.tight_layout()
plt.savefig('simulator/pirc101_simulation_chart.png')
print("Simulation complete. Chart saved in 'simulator/' folder.")
        # Allowed REF exit is capped by available daily door (0.1% USD) conceptualized back to REF
        allowed_ref_exit_amount = min(exit_requests_ref, daily_exit_pool_usd * self.qwf / self.pi_price) # Simplified conceptual view
        
        # Update State: Full Solvency Check
        # REF supply is burnt at the conceptual exit point to preserve protocol safety.
        self.ref_supply -= allowed_ref_exit_amount
        
        if self.ref_supply < 0: self.ref_supply = 0

        # Collect data for plotting
        self.history['epoch'].append(self.epoch)
        self.history['phi'].append(phi)
        self.history['liquidity'].append(self.liquidity)
        self.history['ref_supply'].append(self.ref_supply)

# --- Execute Simulation (120-Day Stochastic Stress Test) ---
# Testing prolonged Bear market scenario with behavioral agents.
sim = PiRC101_Hardened_Sim(num_agents=300)
for _ in range(120):
    sim.run_epoch()

# --- Visualization Script using Matplotlib ---
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

# Plot 1: System Health Indicator (Phi)
ax1.plot(sim.history['epoch'], sim.history['phi'], color='red', linewidth=2, label='System Solvency (Phi)')
ax1.axhline(y=1.0, color='green', linestyle='--', label='Optimal Expansion (1.0)')
ax1.set_title('PiRC-101 Guardrail: Reflexive Phi Throttling Under Panicked Agent-Based Behavior')
ax1.set_ylabel('Phi Value (State Machine Guard)')
ax1.legend(loc='lower left')
ax1.grid(True)

# Plot 2: Macroeconomic Trends (Liquidity vs Supply)
ax2.plot(sim.history['epoch'], sim.history['liquidity'], color='blue', label='External AMM Liquidity (USD)')
ax2.set_ylabel('Liquidity Depth (USD)', color='blue')
ax2.tick_params(axis='y', labelcolor='blue')

ax3 = ax2.twinx()
ax3.plot(sim.history['epoch'], sim.history['ref_supply'], color='purple', linestyle='-', label='Internal REF Supply (Credit)')
ax3.set_ylabel('Credit Supply (REF)', color='purple')
ax3.tick_params(axis='y', labelcolor='purple')

ax2.set_title('Protocol Convergence: Liquidity Depletion vs Deterministic Supply Cap')
ax2.set_xlabel('Epoch (Days)')
ax2.grid(True)

plt.tight_layout()
plt.savefig('simulator/pirc101_simulation_chart.png')
print("Simulation complete. Chart saved in 'simulator/' folder.")
