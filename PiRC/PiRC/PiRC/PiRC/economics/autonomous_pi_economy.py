import random

years = 10

supply = 1000000000
liquidity = 50000000
activity = 100000

for year in range(1, years+1):

    activity_growth = random.uniform(0.05,0.20)
    liquidity_growth = random.uniform(0.03,0.15)

    activity *= (1 + activity_growth)
    liquidity *= (1 + liquidity_growth)

    fees = activity * 0.01
    rewards = fees * 1.2

    supply += rewards

    print("Year:",year)
    print("Supply:",int(supply))
    print("Liquidity:",int(liquidity))
    print("Activity:",int(activity))
    print("Fees:",int(fees))
    print("Rewards:",int(rewards))
    print("--------------------")
