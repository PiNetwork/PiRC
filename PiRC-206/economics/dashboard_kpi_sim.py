
def compliance_score(active_layers=7):
    return round(active_layers / 7, 4)


def generate_dashboard_snapshot(active_layers=7, engagement_score=6400):
    return {
        "compliance_score": compliance_score(active_layers),
        "engagement_score": engagement_score,
        "status": "ready" if active_layers == 7 else "degraded",
    }


if __name__ == "__main__":
    print(generate_dashboard_snapshot())
