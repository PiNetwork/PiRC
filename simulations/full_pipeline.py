from attention_model import AttentionEconomy
from ai_verification import generate_user

def run_full_simulation(users=1000):
    rewards = []

    for _ in range(users):
        u = generate_user()

        reward = (
            u["attention"] *
            u["quality"] *
            u["verification"]
        )

        rewards.append(reward)

    total = sum(rewards)

    print("Total Rewards:", total)
    print("Avg Reward:", total / users)

    return rewards


if __name__ == "__main__":
    run_full_simulation()
