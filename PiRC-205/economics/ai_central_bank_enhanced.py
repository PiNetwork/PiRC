
def stabilize_ippr(current_ippr: float, supply: int, target: int = 314_000_000) -> float:
    error = (target - supply) / target
    updated = current_ippr * (1 + 0.05 * error)
    return max(0.0, updated)


def run_policy_path(start_ippr=0.02, start_supply=300_000_000, years=10):
    ippr = start_ippr
    supply = start_supply
    history = []

    for year in range(1, years + 1):
        ippr = stabilize_ippr(ippr, supply)
        supply = int(supply * (1 + ippr * 0.2))
        history.append({"year": year, "ippr": round(ippr, 6), "supply": supply})

    return history


if __name__ == "__main__":
    print(run_policy_path())
