import random

liquidity = 100000

for day in range(30):

    shock = random.uniform(-0.1,0.1)

    liquidity = liquidity * (1 + shock)

    print("Day",day,"Liquidity:",int(liquidity))
