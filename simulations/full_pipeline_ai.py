from ai_model.inference import predict_verification
import random

def generate_user():
    return {
        "attention": random.uniform(1, 15),
        "quality": random.uniform(0.1, 1.2),
        "behavior": random.uniform(0.1, 1.0),
        "session_time": random.uniform(1, 15),
        "interaction_rate": random.uniform(1, 10),
    }

def run_simulation(n=1000):
    rewards = []

    for _ in range(n):
        user = generate_user()

        V = predict_verification(user)

        reward = (
            user["attention"] *
            user["quality"] *
            V
        )

        rewards.append(reward)

    print("Total:", sum(rewards))
    print("Avg:", sum(rewards) / n)


if __name__ == "__main__":
    run_simulation()
