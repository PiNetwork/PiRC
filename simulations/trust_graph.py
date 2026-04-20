import random

class User:
    def __init__(self, id):
        self.id = id
        self.local_score = random.uniform(0.5, 1.0)
        self.trust_score = self.local_score
        self.neighbors = []

class TrustGraph:
    def __init__(self, num_users=50):
        self.users = [User(i) for i in range(num_users)]

        # random connections
        for user in self.users:
            connections = random.sample(self.users, random.randint(1, 5))
            user.neighbors = [(n, random.uniform(0.1, 1.0)) for n in connections if n != user]

    def propagate_trust(self, iterations=5, alpha=0.6, beta=0.4):
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

    def summary(self):
        scores = [u.trust_score for u in self.users]
        return {
            "avg_trust": sum(scores) / len(scores),
            "max_trust": max(scores),
            "min_trust": min(scores)
        }


if __name__ == "__main__":
    tg = TrustGraph(100)
    tg.propagate_trust()

    print(tg.summary())
