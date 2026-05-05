import statistics


def stable_price(kraken, kucoin, binance, phi=0.05):
    median_price = statistics.median([kraken, kucoin, binance])
    return round(median_price * (1 + phi), 6)


def simulate_quotes(quotes):
    computed = [stable_price(k, ku, b) for k, ku, b in quotes]
    return {
        "samples": len(computed),
        "avg_stable_price": round(sum(computed) / len(computed), 6) if computed else 0,
        "latest_stable_price": computed[-1] if computed else 0,
    }


if __name__ == "__main__":
    sample_quotes = [(0.81, 0.79, 0.83), (0.84, 0.82, 0.85), (0.88, 0.87, 0.89)]
    print(simulate_quotes(sample_quotes))
