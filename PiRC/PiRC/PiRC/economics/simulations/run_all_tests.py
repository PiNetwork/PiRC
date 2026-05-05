from simulations.sybil_vs_trust_graph import run_simulation
from metrics.security_metrics import attack_resistance

result = run_simulation()

print("=== PiRC Security Test ===")
print("Without Trust:", round(result["without_trust"], 3))
print("With Trust:", round(result["with_trust"], 3))

improvement = attack_resistance(
    result["without_trust"],
    result["with_trust"]
)

print("Attack Resistance:", round(improvement, 3))
