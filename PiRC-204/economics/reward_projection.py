
def allocate_rewards(total_vault, active_ratio):
    base = total_vault * 0.0314
    return int(base * (1 + max(0.0, min(active_ratio, 1.0))))


def project_supply(years=10, base_supply=314_000_000, yearly_vault=25_000_000):
    active_curve = [0.35, 0.38, 0.42, 0.47, 0.51, 0.56, 0.6, 0.63, 0.66, 0.7]
    supply = base_supply

    for year in range(years):
        ratio = active_curve[min(year, len(active_curve) - 1)]
        supply += allocate_rewards(yearly_vault, ratio)

    return {
        "years": years,
        "starting_supply": base_supply,
        "ending_supply": supply,
        "target_theme": "314M",
    }


if __name__ == "__main__":
    print(project_supply())
