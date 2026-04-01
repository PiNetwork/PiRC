import numpy as np
import matplotlib.pyplot as plt

# =========================
# CONFIG
# =========================
NUM_USERS = 300
EPOCHS = 30
SEED = 42

np.random.seed(SEED)

# =========================
# INITIAL STATE
# =========================

stake = np.random.exponential(scale=50, size=NUM_USERS)
utility = np.random.rand(NUM_USERS)
trust = np.random.rand(NUM_USERS)
behavior = np.random.rand(NUM_USERS)

# Trust Graph (adjacency matrix)
trust_graph = np.random.rand(NUM_USERS, NUM_USERS)
trust_graph = (trust_graph + trust_graph.T) / 2  # symmetric

# Price + Liquidity
price = 1.0
liquidity_pi = 10000
liquidity_token = 10000

price_history = []
gini_history = []

# =========================
# HELPERS
# =========================

def normalize(x):
    return (x - np.min(x)) / (np.max(x) - np.min(x) + 1e-9)

def gini(x):
    sorted_x = np.sort(x)
    n = len(x)
    cum = np.cumsum(sorted_x)
    return (n + 1 - 2 * np.sum(cum) / cum[-1]) / n

def sigmoid(x):
    return 1 / (1 + np.exp(-5 * (x - 0.5)))

# =========================
# TRUST PROPAGATION
# =========================
def update_trust(trust, graph):
    propagated = graph @ trust / np.sum(graph, axis=1)
    return 0.5 * trust + 0.5 * propagated

# =========================
# AI ALLOCATION
# =========================
def ai_allocate(b, t, u):
    alpha, beta, gamma = 0.3, 0.3, 0.4
    
    b, t, u = sigmoid(b), sigmoid(t), sigmoid(u)
    score = alpha*b + beta*t + gamma*u
    
    # Anti-sybil penalty
    penalty = (t < 0.3) & (u < 0.3)
    score[penalty] *= 0.4
    
    return score / np.sum(score)

# =========================
# MARKET (AMM SIMULATION)
# =========================
def swap_sell(amount_token):
    global liquidity_pi, liquidity_token
    
    k = liquidity_pi * liquidity_token
    liquidity_token += amount_token
    liquidity_pi = k / liquidity_token
    
    return liquidity_pi / liquidity_token

# =========================
# MAIN LOOP (EPOCHS)
# =========================
for epoch in range(EPOCHS):

    # Normalize inputs
    b = normalize(behavior)
    t = normalize(trust)
    u = normalize(utility)

    # Allocation
    allocation = ai_allocate(b, t, u)

    # Simulate selling pressure
    sell_pressure = (1 - behavior) * allocation * 50  # low behavior = more likely to dump
    total_sell = np.sum(sell_pressure)

    # Update price via AMM
    price = swap_sell(total_sell)

    # Update trust via graph
    trust = update_trust(trust, trust_graph)

    # Update utility (active users gain more)
    utility += behavior * 0.05
    utility = np.clip(utility, 0, 1)

    # Behavior evolves (random + feedback)
    behavior += np.random.normal(0, 0.05, NUM_USERS)
    behavior = np.clip(behavior, 0, 1)

    # Track metrics
    price_history.append(price)
    gini_history.append(gini(allocation))

# =========================
# VISUALIZATION
# =========================

# Price evolution
plt.figure()
plt.plot(price_history)
plt.title("Token Price Over Time (AI Allocation)")
plt.xlabel("Epoch")
plt.ylabel("Price")
plt.grid()
plt.show()

# Fairness (Gini)
plt.figure()
plt.plot(gini_history)
plt.title("Gini Coefficient Over Time")
plt.xlabel("Epoch")
plt.ylabel("Gini")
plt.grid()
plt.show()

# Final distribution
plt.figure()
plt.hist(allocation, bins=40)
plt.title("Final Allocation Distribution")
plt.show()

# =========================
# OUTPUT
# =========================
print("=== FINAL METRICS ===")
print(f"Final Price: {price:.4f}")
print(f"Final Gini: {gini_history[-1]:.4f}")
