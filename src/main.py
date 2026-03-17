class LayeredCandlestick:
    def __init__(self, indicators, weights):
        self.indicators = indicators
        self.weights = weights
        self.visible_metrics = list(indicators.keys())  # Default: all visible

    def toggle_metric(self, metric):
        """Show/hide a metric"""
        if metric in self.visible_metrics:
            self.visible_metrics.remove(metric)
        else:
            self.visible_metrics.append(metric)

    def compute_values(self):
        """Compute high, low, and weighted body based on visible metrics"""
        visible_vals = {k: self.indicators[k] for k in self.visible_metrics}
        high = max(visible_vals.values())
        low = min(visible_vals.values())
        body = sum(visible_vals[k] * self.weights[k] for k in visible_vals)
        return high, low, body

    def render(self):
        high, low, body = self.compute_values()
        print(f"High: {high}, Low: {low}, Body: {body}")
        print(f"Visible Metrics: {self.visible_metrics}")


if __name__ == "__main__":
    indicators = {
        "DAU": 18000,
        "Transactions": 25000,
        "New Projects": 10,
        "Verified": 8,
        "Token Value": 1.08
    }

    weights = {"DAU": 0.25, "Transactions": 0.25, "New Projects": 0.15, "Verified": 0.15, "Token Value": 0.20}

    candlestick = LayeredCandlestick(indicators, weights)
    candlestick.toggle_metric("Token Value")  # Hide token value temporarily
    candlestick.render()
