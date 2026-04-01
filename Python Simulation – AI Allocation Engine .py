import numpy as np
import matplotlib.pyplot as plt

# =========================
# CONFIG
# =========================
NUM_USERS = 500
SEED = 42

np.random.seed(SEED)

# =========================
# GENERATE USER DATA
# =========================

# Stake (skewed distribution - whales exist)
stake = np.random.exponential(scale=50, size=NUM_USERS)

# Utility Score (PoU)
utility = np.random.beta(a=2, b=5, size=NUM_USERS)

# Trust Score (TS)
trust = np.random.beta(a=3, b=3, size=NUM_USERS)

# Behavior Score (consistency / activity)
behavior = np.random.beta(a=2, b=2, size=NUM_USERS)

# =========================
# SIMULATE SYBIL ATTACK
# =========================
sybil_indices = np.random.choice(NUM_USERS, size=int(0.1 * NUM_USERS), replace=False)

# Sybil users: high stake but low trust & utility
stake[sybil_indices] *= 3
utility[sybil_indices] *= 0.2
trust[sybil_indices] *= 0.2

# =========================
# NORMALIZATION FUNCTION
# =========================
def normalize(x):
    return (x - np.min(x)) / (np.max(x) - np.min(x) + 1e-9)

stake_n = normalize(stake)
utility_n = normalize(utility)
trust_n = normalize(trust)
behavior_n = normalize(behavior)

# =========================
# TRADITIONAL ALLOCATION (STAKING ONLY)
# =========================
alloc_staking = stake / np.sum(stake)

# =========================
# AI ALLOCATION ENGINE
# =========================

def ai_allocation(behavior, trust, utility):
    # Dynamic weights (can evolve)
    alpha = 0.3   # behavior
    beta  = 0.3   # trust
    gamma = 0.4   # utility

    # Non-linear transformation (sigmoid-like)
    def transform(x):
        return 1 / (1 + np.exp(-5 * (x - 0.5)))

    b = transform(behavior)
    t = transform(trust)
    u = transform(utility)

    raw_score = alpha * b + beta * t + gamma * u

    # Anti-Sybil penalty
    penalty = (trust < 0.3) & (utility < 0.3)
    raw_score[penalty] *= 0.5

    # Normalize to allocation
    allocation = raw_score / np.sum(raw_score)
    return allocation

alloc_ai = ai_allocation(behavior_n, trust_n, utility_n)

# =========================
# METRICS
# =========================

def gini(x):
    sorted_x = np.sort(x)
    n = len(x)
    cumulative = np.cumsum(sorted_x)
    return (n + 1 - 2 * np.sum(cumulative) / cumulative[-1]) / n

gini_staking = gini(alloc_staking)
gini_ai = gini(alloc_ai)

# =========================
# VISUALIZATION
# =========================

plt.figure()
plt.scatter(alloc_staking, alloc_ai)
plt.xlabel("Staking Allocation")
plt.ylabel("AI Allocation")
plt.title("AI Allocation vs Staking")
plt.grid()
plt.show()

# Distribution comparison
plt.figure()
plt.hist(alloc_staking, bins=50, alpha=0.5, label="Staking")
plt.hist(alloc_ai, bins=50, alpha=0.5, label="AI Allocation")
plt.legend()
plt.title("Distribution Comparison")
plt.show()

# =========================
# OUTPUT RESULTS
# =========================

print("=== RESULTS ===")
print(f"Gini (Staking): {gini_staking:.4f}")
print(f"Gini (AI Allocation): {gini_ai:.4f}")

print("\nTop 10 Allocation (Staking):")
print(np.sort(alloc_staking)[-10:])

print("\nTop 10 Allocation (AI):")
print(np.sort(alloc_ai)[-10:])
