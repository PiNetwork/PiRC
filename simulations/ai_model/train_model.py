import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

def generate_dataset(n=5000):
    X = []
    y = []

    for _ in range(n):
        is_bot = random.random() < 0.3

        if is_bot:
            attention = random.uniform(8, 15)
            quality = random.uniform(0.1, 0.5)
            behavior = random.uniform(0.1, 0.3)
            session_time = random.uniform(1, 3)
            interaction_rate = random.uniform(5, 10)
        else:
            attention = random.uniform(2, 10)
            quality = random.uniform(0.6, 1.2)
            behavior = random.uniform(0.6, 1.0)
            session_time = random.uniform(5, 15)
            interaction_rate = random.uniform(1, 5)

        X.append([
            attention,
            quality,
            behavior,
            session_time,
            interaction_rate
        ])

        y.append(0 if is_bot else 1)

    return np.array(X), np.array(y)


def train():
    X, y = generate_dataset()

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)

    joblib.dump(model, "ai_verification_model.pkl")

    print("Model trained & saved!")


if __name__ == "__main__":
    train()
