import time
import random

class JusticeEngineOracle:
    """
    Simulates the Multi-Source Medianized Oracle feed for PiRC-101.
    Includes a 15% Volatility Circuit Breaker.
    """
    def __init__(self):
        self.qwf = 10_000_000  # Sovereign Multiplier
        self.base_price = 0.2248
        self.last_price = 0.2248

    def fetch_medianized_price(self):
        # Simulating aggregation from 3 independent sources
        fluctuation = random.uniform(-0.005, 0.005)
        current_price = self.base_price + fluctuation
        
        # 15% Deviation Check (Circuit Breaker)
        deviation = abs(current_price - self.last_price) / self.last_price
        if deviation > 0.15:
            print("[CRITICAL] Oracle Desync Detected! Triggering Circuit Breaker.")
            return self.last_price
        
        self.last_price = current_price
        return current_price

    def run_dashboard(self):
        print("--- PiRC-101 Justice Engine: Live Feed ---")
        try:
            while True:
                price = self.fetch_medianized_price()
                ippr = price * self.qwf
                print(f"[ORACLE] Market: ${price:.4f} | IPPR (USD): ${ippr:,.2f}")
                time.sleep(5)
        except KeyboardInterrupt:
            print("\nShutting down Oracle stream...")

if __name__ == "__main__":
    oracle = JusticeEngineOracle()
    oracle.run_dashboard()
