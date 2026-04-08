import numpy as np


def simulate_utility_gate(years=10, initial_pioneers=314_000_000, base_retention=0.65, seed=42):
    rng = np.random.default_rng(seed)
    samples = min(initial_pioneers, 200_000)

    scores = rng.normal(6000, 2000, samples)
    gated_ratio = float((scores >= 5000).mean())

    annual_retention = min(0.99, base_retention * (1 + 3.14 * gated_ratio))
    projected_supply = int(initial_pioneers * (annual_retention ** years))

    return {
        "years": years,
        "initial_pioneers": initial_pioneers,
        "projected_supply": projected_supply,
        "gated_ratio": round(gated_ratio, 4),
        "retention_multiplier": 3.14,
    }


if __name__ == "__main__":
    print(simulate_utility_gate())
