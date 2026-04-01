import numpy as np
import matplotlib.pyplot as plt
from collections import deque

# =========================
# CONFIG
# =========================
N = 400
EPOCHS = 50
SEED = 42
np.random.seed(SEED)

FEE = 0.003
INITIAL_PRICE = 1.0
LP_PI = 20000.0
LP_TOKEN = 20000.0

# RL (bandit) for weights selection
WEIGHT_OPTIONS = [
    (0.3, 0.3, 0.4),
    (0.2, 0.4, 0.4),
    (0.4, 0.3, 0.3),
    (0.25, 0.25, 0.5),
    (0.33, 0.33, 0.34),
]
eps = 0.2  # exploration
q_values = np.zeros(len(WEIGHT_OPTIONS))
counts = np.zeros(len(WEIGHT_OPTIONS))

# =========================
# USERS (AGENTS)
# =========================
# Features
stake = np.random.exponential(scale=60, size=N)
utility = np.random.beta(2, 5, size=N)
trust = np.random.beta(3, 3, size=N)
behavior = np.random.beta(2, 2, size=N)

# Strategies: holder, trader, farmer
strategies = np.random.choice(["holder", "trader", "farmer"], size=N, p=[0.4, 0.35, 0.25])

# Vesting & cooldown
locked = np.zeros(N)       # locked tokens ratio
cooldown = np.zeros(N)     # epochs remaining

# =========================
# TRUST GRAPH
# =========================
G = np.random.rand(N, N)
G = (G + G.T) / 2
np.fill_diagonal(G, 0)

def normalize(x):
    return (x - x.min()) / (x.max() - x.min() + 1e-9)

def sigmoid(x):
    return 1 / (1 + np.exp(-5*(x - 0.5)))

def gini(x):
    s = np.sort(x)
    n = len(x)
    cum = np.cumsum(s)
    return (n + 1 - 2 * np.sum(cum) / cum[-1]) / n

def trust_propagate(t, G, decay=0.1):
    deg = G.sum(axis=1) + 1e-9
    prop = (G @ t) / deg
    return (1 - decay) * t + decay * prop

# =========================
# AMM (x*y=k) with fee
# =========================
class AMM:
    def __init__(self, x, y, fee=0.003):
        self.x = x  # PI
        self.y = y  # TOKEN
        self.fee = fee

    def price(self):
        return self.x / self.y

    def swap_sell(self, token_in):
        # user sells token -> gets PI
        token_in_eff = token_in * (1 - self.fee)
        k = self.x * self.y
        self.y += token_in_eff
        self.x = k / self.y
        return self.price()

    def swap_buy(self, pi_in):
        # user buys token -> spends PI
        pi_in_eff = pi_in * (1 - self.fee)
        k = self.x * self.y
        self.x += pi_in_eff
        self.y = k / self.x
        return self.price()

amm = AMM(LP_PI, LP_TOKEN, FEE)

# =========================
# AI ALLOCATION
# =========================
def ai_allocate(b, t, u, weights):
    a, bta, g = weights
    B, T, U = sigmoid(b), sigmoid(t), sigmoid(u)
    score = a*B + bta*T + g*U

    # Anti-sybil penalty
    penalty = (T < 0.3) & (U < 0.3)
    score[penalty] *= 0.4

    return score / score.sum()

# =========================
# ATTACKS
# =========================
def inject_sybil_swarm(stake, utility, trust, behavior, ratio=0.1):
    idx = np.random.choice(len(stake), int(len(stake)*ratio), replace=False)
    stake[idx] *= 3.0
    utility[idx] *= 0.2
    trust[idx] *= 0.2
    behavior[idx] *= 0.3
    return idx

def coordinated_dump(allocation, behavior, intensity=1.0):
    # low behavior agents dump more
    return (1 - behavior) * allocation * 100 * intensity

# =========================
# RL (epsilon-greedy)
# =========================
def select_weights():
    if np.random.rand() < eps:
        return np.random.randint(len(WEIGHT_OPTIONS))
    return np.argmax(q_values)

def update_q(idx, reward):
    counts[idx] += 1
    q_values[idx] += (reward - q_values[idx]) / counts[idx]

# =========================
# TRACKING
# =========================
price_hist = []
gini_hist = []
reward_hist = []
weights_hist = []

# =========================
# MAIN LOOP
# =========================
# Initial attack
sybil_idx = inject_sybil_swarm(stake, utility, trust, behavior, ratio=0.12)

for epoch in range(EPOCHS):

    # Normalize features
    b = normalize(behavior)
    t = normalize(trust)
    u = normalize(utility)

    # RL choose weights
    w_idx = select_weights()
    weights = WEIGHT_OPTIONS[w_idx]

    # Allocation
    alloc = ai_allocate(b, t, u, weights)

    # Strategy actions
    sell = np.zeros(N)
    buy = np.zeros(N)

    for i in range(N):
        if cooldown[i] > 0:
            cooldown[i] -= 1
            continue

        if strategies[i] == "holder":
            # rarely sell
            if np.random.rand() < 0.05:
                sell[i] = alloc[i] * 20 * (1 - locked[i])

        elif strategies[i] == "trader":
            # react to short-term price trend
            trend = 0 if len(price_hist) < 3 else price_hist[-1] - price_hist[-3]
            if trend > 0:
                sell[i] = alloc[i] * 30 * (1 - locked[i])
            else:
                buy[i] = alloc[i] * 30

        elif strategies[i] == "farmer":
            # farm & dump
            sell[i] = alloc[i] * 50 * (1 - locked[i])

    # Coordinated dump attack at specific epochs
    if epoch in [10, 25, 40]:
        sell += coordinated_dump(alloc, behavior, intensity=1.5)

    # Execute AMM swaps
    total_sell = sell.sum()
    total_buy = buy.sum()

    if total_sell > 0:
        amm.swap_sell(total_sell)
    if total_buy > 0:
        amm.swap_buy(total_buy)

    price = amm.price()

    # Lifecycle control (simple)
    # increase lock for high-utility users
    locked += (utility > 0.6) * 0.02
    locked = np.clip(locked, 0, 0.7)

    # cooldown for heavy sellers
    heavy = sell > np.percentile(sell, 90)
    cooldown[heavy] = 2

    # Update trust & utility & behavior
    trust = trust_propagate(trust, G, decay=0.15)

    utility += behavior * 0.04
    utility = np.clip(utility, 0, 1)

    behavior += np.random.normal(0, 0.05, N)
    behavior = np.clip(behavior, 0, 1)

    # Reward for RL: stability (low volatility) + fairness (low gini)
    recent_prices = price_hist[-5:] if len(price_hist) >= 5 else price_hist
    vol = np.std(recent_prices) if len(recent_prices) > 1 else 0.0
    fairness = 1 - gini(alloc)

    reward = fairness - 0.5 * vol
    update_q(w_idx, reward)

    # Track
    price_hist.append(price)
    gini_hist.append(gini(alloc))
    reward_hist.append(reward)
    weights_hist.append(weights)

# =========================
# VISUALIZATION
# =========================
plt.figure()
plt.plot(price_hist)
plt.title("Price (AMM) Over Time - V3")
plt.xlabel("Epoch")
plt.ylabel("Price")
plt.grid()
plt.show()

plt.figure()
plt.plot(gini_hist)
plt.title("Gini (Fairness) Over Time - V3")
plt.xlabel("Epoch")
plt.ylabel("Gini")
plt.grid()
plt.show()

plt.figure()
plt.plot(reward_hist)
plt.title("RL Reward Over Time")
plt.xlabel("Epoch")
plt.ylabel("Reward")
plt.grid()
plt.show()

# =========================
# OUTPUT
# =========================
print("=== FINAL METRICS V3 ===")
print(f"Final Price: {price_hist[-1]:.4f}")
print(f"Final Gini: {gini_hist[-1]:.4f}")
print("Selected Weights Frequency:")
unique, counts_w = np.unique(weights_hist, axis=0, return_counts=True)
for w, c in zip(unique, counts_w):
    print(f"Weights {tuple(w)} -> {c} times")
