from simulations.sybil_vs_trust_graph import run_simulation
from metrics.security_metrics import attack_resistance

def test_sybil_resistance():
    result = run_simulation()

    assert result["with_trust"] < result["without_trust"]
    assert result["with_trust"] < 0.2

def test_attack_improvement():
    result = run_simulation()
    improvement = attack_resistance(
        result["without_trust"],
        result["with_trust"]
    )

    assert improvement > 0.5  # minimal 50% improvement
