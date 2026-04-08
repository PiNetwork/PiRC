import random

class User:
    def __init__(self, id, user_type="real"):
        self.id = id
        self.type = user_type  # real / sybil
        self.local_score = self.init_local_score()
        self.trust_score = self.local_score
        self.neighbors = []

    def init_local_score(self):
        if self.type == "real":
            return random.uniform(0.6, 1.0)
        else:
            return random.uniform(0.1, 0.4)

class Simulation:
    def __init__(self, real_n=100, sybil_n=100):
        self.users = []

        # Create real users
        self.real_users = [User(f"R{i}", "real") for i in range(real_n)]

        # Create sybil users
        self.sybil_users = [User(f"S{i}", "sybil") for i in range(sybil_n)]

        self.users = self.real_users + self.sybil_users

        self.create_connections()

    def create_connections(self):
        # Real users connect naturally
        for user in self.real_users:
            neighbors = random.sample(self.real_users, random.randint(3, 10))
            user.neighbors = [(n, random.uniform(0.5, 1.0)) for n in neighbors if n != user]

        # Sybil cluster: strong internal connections
        for user in self.sybil_users:
            neighbors = random.sample(self.sybil_users, random.randint(5, 15))
            user.neighbors = [(n, random.uniform(0.7, 1.0)) for n in neighbors if n != user]

        # Weak connection to real network (simulate attack)
        for user in self.sybil_users:
            if random.random() < 0.2:  # only some connect out
                target = random.choice(self.real_users)
                user.neighbors.append((target, random.uniform(0.1, 0.3)))

    def propagate_trust(self, iterations=10, alpha=0.6, beta=0.4):
        for _ in range(iterations):
            new_scores = []

            for user in self.users:
                network_score = sum(
                    neighbor.trust_score * weight
                    for neighbor, weight in user.neighbors
                )

                total = alpha * user.local_score + beta * network_score
                new_scores.append(total)

            for i, user in enumerate(self.users):
                user.trust_score = new_scores[i]

    def distribute_rewards(self, total_reward=1000):
        total_trust = sum(u.trust_score for u in self.users)

        for user in self.users:
            user.reward = total_reward * (user.trust_score / total_trust)

    def summary(self):
        real_reward = sum(u.reward for u in self.real_users)
        sybil_reward = sum(u.reward for u in self.sybil_users)

        return {
            "real_users": len(self.real_users),
            "sybil_users": len(self.sybil_users),
            "real_reward": real_reward,
            "sybil_reward": sybil_reward,
            "sybil_ratio": sybil_reward / (real_reward + sybil_reward)
        }


if __name__ == "__main__":
    sim = Simulation(real_n=100, sybil_n=100)

    sim.propagate_trust()
    sim.distribute_rewards()

    result = sim.summary()

    print("=== Sybil vs Trust Graph Result ===")
    print(result)
