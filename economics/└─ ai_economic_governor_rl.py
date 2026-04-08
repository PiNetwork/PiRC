import numpy as np
import random

# ------------------------------
# Environment Model
# ------------------------------

class PiEconomyEnv:

    def __init__(self):

        self.liquidity = 50
        self.tx_volume = 500
        self.reward_multiplier = 1.0

    def get_state(self):

        liquidity_state = int(self.liquidity // 10)
        volume_state = int(self.tx_volume // 100)

        return (liquidity_state, volume_state)

    def step(self, action):

        # Actions
        # 0 = decrease rewards
        # 1 = keep rewards
        # 2 = increase rewards

        if action == 0:
            self.reward_multiplier *= 0.95

        elif action == 2:
            self.reward_multiplier *= 1.05

        # Simulate economic response
        liquidity_change = np.random.normal(self.reward_multiplier * 2, 3)
        volume_change = np.random.normal(self.reward_multiplier * 5, 10)

        self.liquidity += liquidity_change
        self.tx_volume += volume_change

        reward = self.calculate_reward()

        return self.get_state(), reward

    def calculate_reward(self):

        # target values
        target_liquidity = 60
        target_volume = 800

        liquidity_score = -abs(self.liquidity - target_liquidity)
        volume_score = -abs(self.tx_volume - target_volume)

        return liquidity_score + volume_score


# ------------------------------
# RL Agent
# ------------------------------

class EconomicGovernorRL:

    def __init__(self):

        self.q_table = {}
        self.actions = [0,1,2]

        self.alpha = 0.1
        self.gamma = 0.9
        self.epsilon = 0.1

    def get_q(self, state, action):

        return self.q_table.get((state, action), 0)

    def choose_action(self, state):

        if random.random() < self.epsilon:
            return random.choice(self.actions)

        qs = [self.get_q(state,a) for a in self.actions]

        return self.actions[np.argmax(qs)]

    def update(self, state, action, reward, next_state):

        old_q = self.get_q(state, action)

        future_q = max([self.get_q(next_state,a) for a in self.actions])

        new_q = old_q + self.alpha * (reward + self.gamma * future_q - old_q)

        self.q_table[(state,action)] = new_q


# ------------------------------
# Training Loop
# ------------------------------

def train():

    env = PiEconomyEnv()
    agent = EconomicGovernorRL()

    episodes = 1000

    for ep in range(episodes):

        state = env.get_state()

        for step in range(50):

            action = agent.choose_action(state)

            next_state, reward = env.step(action)

            agent.update(state, action, reward, next_state)

            state = next_state

    return agent


# ------------------------------
# Run Simulation
# ------------------------------

if __name__ == "__main__":

    agent = train()

    print("Training complete.")
    print("Learned policy sample:")

    for key,val in list(agent.q_table.items())[:10]:
        print(key,val)
