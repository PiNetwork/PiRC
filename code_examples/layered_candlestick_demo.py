from src.main import LayeredCandlestick

indicators = {
    "DAU": 18000,
    "Transactions": 25000,
    "New Projects": 10,
    "Verified": 8,
    "Token Value": 1.08
}

weights = {"DAU": 0.25, "Transactions": 0.25, "New Projects": 0.15, "Verified": 0.15, "Token Value": 0.20}

candlestick = LayeredCandlestick(indicators, weights)
candlestick.toggle_metric("Token Value")
candlestick.render()
