import numpy as np
import matplotlib.pyplot as plt
import os

# =========================
# SETUP OUTPUT FOLDER
# =========================
OUTPUT_DIR = "simulation_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# =========================
# SAMPLE DATA (replace with your simulation result)
# =========================
# (Kalau sudah punya hasil dari V3, langsung replace variabel ini)
epochs = 50
price_hist = np.cumprod(1 + np.random.normal(0, 0.02, epochs))  # simulasi harga
gini_hist = np.clip(np.random.normal(0.3, 0.05, epochs), 0, 1)
reward_hist = np.random.normal(0.2, 0.1, epochs)

# =========================
# STYLE (clean publication)
# =========================
plt.rcParams.update({
    "figure.figsize": (8, 5),
    "font.size": 10,
})

# =========================
# 1. PRICE CHART
# =========================
plt.figure()
plt.plot(price_hist)
plt.title("Token Price Over Time (AI Allocation V3)")
plt.xlabel("Epoch")
plt.ylabel("Price")
plt.grid()

price_path = os.path.join(OUTPUT_DIR, "price_evolution.png")
plt.savefig(price_path, dpi=300, bbox_inches="tight")
plt.close()

# =========================
# 2. GINI (FAIRNESS)
# =========================
plt.figure()
plt.plot(gini_hist)
plt.title("Gini Coefficient Over Time")
plt.xlabel("Epoch")
plt.ylabel("Gini Index")
plt.grid()

gini_path = os.path.join(OUTPUT_DIR, "gini_fairness.png")
plt.savefig(gini_path, dpi=300, bbox_inches="tight")
plt.close()

# =========================
# 3. RL REWARD
# =========================
plt.figure()
plt.plot(reward_hist)
plt.title("AI Reward Optimization Over Time")
plt.xlabel("Epoch")
plt.ylabel("Reward Score")
plt.grid()

reward_path = os.path.join(OUTPUT_DIR, "ai_reward.png")
plt.savefig(reward_path, dpi=300, bbox_inches="tight")
plt.close()

# =========================
# 4. DISTRIBUTION (FINAL)
# =========================
final_alloc = np.random.dirichlet(np.ones(100), size=1)[0]

plt.figure()
plt.hist(final_alloc, bins=40)
plt.title("Final Allocation Distribution")
plt.xlabel("Allocation Share")
plt.ylabel("Frequency")

dist_path = os.path.join(OUTPUT_DIR, "allocation_distribution.png")
plt.savefig(dist_path, dpi=300, bbox_inches="tight")
plt.close()

# =========================
# OUTPUT INFO
# =========================
print("=== EXPORT SUCCESS ===")
print(f"Saved:")
print(f"- {price_path}")
print(f"- {gini_path}")
print(f"- {reward_path}")
print(f"- {dist_path}")
