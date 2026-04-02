import requests

# dummy contract interface (sementara)
class ContractClient:
    def mint(self, user_address, reward):
        print(f"[CONTRACT] Mint {reward} to {user_address}")

contract = ContractClient()


def process_user(user, user_address):
    # 1. Call AI Oracle
    res = requests.post(
        "http://localhost:8000/verify",
        json=user
    )

    V = res.json()["verification_score"]

    # 2. Calculate reward
    reward = user["attention"] * user["quality"] * V

    # 3. Send to contract
    contract.mint(user_address, reward)

    return {
        "verification": V,
        "reward": reward
    }


if __name__ == "__main__":
    user = {
        "attention": 8,
        "quality": 0.9,
        "behavior": 0.8,
        "session_time": 10,
        "interaction_rate": 3
    }

    result = process_user(user, "USER_1")
    print(result)
  balances = {}

def update_balance(user_address, reward):
    balances[user_address] = balances.get(user_address, 0) + reward
    return balances[user_address]
