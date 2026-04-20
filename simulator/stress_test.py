import math
import random

class PiRC101_Dynamic_Simulator:
    def __init__(self):
        # Genesis State (Omega 0)
        self.epoch = 0
        self.external_pi_price = 0.314
        self.amm_liquidity_depth = 10_000_000  # $10M in USDT
        self.total_ref_supply = 0
        self.total_pi_locked = 0
        
        # Constants
        self.QWF = 10_000_000
        self.GAMMA = 1.5
        self.DAILY_EXIT_CAP = 0.001  # 0.1%

    def calculate_phi(self):
        if self.total_ref_supply == 0: return 1.0
        available_exit_liquidity = self.amm_liquidity_depth * self.DAILY_EXIT_CAP
        # Ratio of available exit door to total debt (normalized)
        ratio = available_exit_liquidity / (self.total_ref_supply / self.QWF)
        
        if ratio >= self.GAMMA: return 1.0
        return (ratio / self.GAMMA) ** 2

    def step(self, action, pi_amount=0):
        self.epoch += 1
        print(f"\n--- Epoch {self.epoch} | Action: {action} ---")
        
        if action == "MINT":
            phi = self.calculate_phi()
            if phi < 0.1:
                print("🚨 TRANSACTION REJECTED: Solvency Guardrail Triggered. Minting Paused.")
                return

            captured_usd = pi_amount * self.external_pi_price
            minted_ref = captured_usd * self.QWF * phi
            
            self.total_pi_locked += pi_amount
            self.total_ref_supply += minted_ref
            print(f"✅ Minted {minted_ref:,.0f} REF for {pi_amount} Pi. (Phi applied: {phi:.4f})")

        elif action == "CRASH":
            print("📉 MARKET EVENT: External liquidity and price drop by 40%!")
            self.external_pi_price *= 0.60
            self.amm_liquidity_depth *= 0.60

        self.print_state()

    def print_state(self):
        phi = self.calculate_phi()
        print(f"State -> Price: ${self.external_pi_price:.3f} | Liquidity: ${self.amm_liquidity_depth:,.0f}")
        print(f"State -> Locked Pi: {self.total_pi_locked:,.0f} | REF Supply: {self.total_ref_supply:,.0f}")
        print(f"System Health (Phi): {phi:.4f}")

# --- Run the Time-Series Simulation ---
sim = PiRC101_Dynamic_Simulator()

# 1. Normal Ecosystem Growth
sim.step("MINT", pi_amount=500)
sim.step("MINT", pi_amount=1000)

# 2. The Black Swan Crash
sim.step("CRASH")

# 3. Reflexive Guardrail Test (Trying to mint during a crash)
sim.step("MINT", pi_amount=2000) 
