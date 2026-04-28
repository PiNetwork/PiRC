import numpy as np
import matplotlib.pyplot as plt

years = 10
months = years * 12
t = np.arange(months)

# ---------- Liquidity Growth ----------
L_max = 100
k = 0.05
liquidity = L_max / (1 + np.exp(-k*(t-60)))

# ---------- Reward Emission ----------
initial_reward = 50
decay_rate = 0.01
reward = initial_reward * np.exp(-decay_rate*t)

# ---------- Ecosystem Supply ----------
base_supply = 1000
supply = base_supply + np.cumsum(reward)*0.1

# ---------- Utility Growth ----------
utility = np.log1p(t) * 10

# ---------- Plot Liquidity ----------
plt.figure()
plt.plot(t, liquidity)
plt.title("PiRC Liquidity Growth Projection (10 Years)")
plt.xlabel("Months")
plt.ylabel("Liquidity Index")
plt.savefig("results/liquidity_growth.png")

# ---------- Plot Reward ----------
plt.figure()
plt.plot(t, reward)
plt.title("Reward Emission Projection (10 Years)")
plt.xlabel("Months")
plt.ylabel("Reward Index")
plt.savefig("results/reward_emission.png")

# ---------- Plot Supply ----------
plt.figure()
plt.plot(t, supply)
plt.title("Ecosystem Supply Projection (10 Years)")
plt.xlabel("Months")
plt.ylabel("Supply Index")
plt.savefig("results/supply_projection.png")

# ---------- Plot Utility ----------
plt.figure()
plt.plot(t, utility)
plt.title("Utility Growth Projection")
plt.xlabel("Months")
plt.ylabel("Utility Index")
plt.savefig("results/utility_growth.png")

print("Simulation complete. Results saved in /results")
