# simulations/attention_model.py

import random
import statistics

class User:
    def __init__(self, is_bot=False):
        self.is_bot = is_bot

    def generate_attention(self):
        if self.is_bot:
            # bot: high activity but low quality
            A = random.uniform(5, 15)
            Q = random.uniform(0.1, 0.5)
            V = random.uniform(0.0, 0.3)
        else:
            # human: moderate activity, higher quality
            A = random.uniform(2, 10)
            Q = random.uniform(0.5, 1.5)
            V = random.uniform(0.7, 1.0)

        return A, Q, V


class AttentionEconomy:
    def __init__(self, users=1000, bot_ratio=0.2, max_daily_emission=10000):
        self.users = users
        self.bot_ratio = bot_ratio
        self.max_daily_emission = max_daily_emission
        self.population = self._create_population()

    def _create_population(self):
        population = []
        for _ in range(self.users):
            if random.random() < self.bot_ratio:
                population.append(User(is_bot=True))
            else:
                population.append(User(is_bot=False))
        return population

    def calculate_reward(self, A, Q, V):
        return A * Q * V

    def run_epoch(self):
        rewards = []
        raw_rewards = []

        for user in self.population:
            A, Q, V = user.generate_attention()
            r = self.calculate_reward(A, Q, V)
            raw_rewards.append(r)

        total_raw = sum(raw_rewards)

        # normalize to max emission (anti-inflation control)
        if total_raw > 0:
            scale = self.max_daily_emission / total_raw
        else:
            scale = 0

        for r in raw_rewards:
            rewards.append(r * scale)

        return rewards

    def simulate(self, days=30):
        history = []

        for day in range(days):
            rewards = self.run_epoch()
            total = sum(rewards)
            avg = statistics.mean(rewards)
            max_r = max(rewards)

            history.append({
                "day": day + 1,
                "total_emission": total,
                "avg_reward": avg,
                "max_reward": max_r
            })

        return history


if __name__ == "__main__":
    sim = AttentionEconomy(
        users=1000,
        bot_ratio=0.3,  # coba ubah untuk test ketahanan sistem
        max_daily_emission=10000
    )

    results = sim.simulate(days=30)

    print("=== Simulation Results ===\n")

    for day in results:
        print(
            f"Day {day['day']}: "
            f"Total={day['total_emission']:.2f}, "
            f"Avg={day['avg_reward']:.4f}, "
            f"Max={day['max_reward']:.2f}"
        )
