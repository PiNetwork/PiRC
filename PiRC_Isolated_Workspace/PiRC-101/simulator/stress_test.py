import math

def simulate_pirc101_resilience(pi_price, liquidity_depth, current_ref_supply):
    print(f"--- Simulation Start ---")
    print(f"External Pi Price: ${pi_price}")
    print(f"AMM Liquidity Depth: ${liquidity_depth:,.2f}")
    
    # Constants
    QWF = 10_000_000
    Gamma = 1.5
    
    # Calculate Phi
    ratio = liquidity_depth / (current_ref_supply / QWF) if current_ref_supply > 0 else Gamma
    phi = 1.0 if ratio >= Gamma else (ratio / Gamma)**2
    
    # Calculate Minting Power for 1 Pi
    minting_power = pi_price * QWF * phi
    
    print(f"Calculated Phi: {phi:.4f}")
    print(f"Minting Power (1 Pi): {minting_power:,.2f} REF Credits")
    
    if phi < 0.2:
        print("STATUS: CRITICAL - Throttling Engaged to protect solvency.")
    else:
        print("STATUS: HEALTHY - Full expansion enabled.")

# Test Scenario: 50% Market Crash
simulate_pirc101_resilience(pi_price=0.157, liquidity_depth=5_000_000, current_ref_supply=1_000_000_000)

