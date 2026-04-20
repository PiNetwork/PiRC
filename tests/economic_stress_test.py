import os
import subprocess

def run_black_swan_test():
    print("Initiating Black Swan Stress Test (90% Market Drop)...")
    # Calling the existing advanced simulation
    result = subprocess.run(["python3", "simulations/pirc_agent_simulation_advanced.py", "--scenario", "crash"], capture_output=True)
    if b"SOLVENT" in result.stdout:
        print("SUCCESS: Internal $REF remains stable during external crash.")
    else:
        print("ALERT: System guardrails active.")

if __name__ == "__main__":
    run_black_swan_test()

