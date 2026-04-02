import requests

def get_verification(user):
    res = requests.post(
        "http://localhost:8000/verify",
        json=user
    )
    return res.json()["verification_score"]


if __name__ == "__main__":
    user = {
        "attention": 8,
        "quality": 0.9,
        "behavior": 0.8,
        "session_time": 10,
        "interaction_rate": 3
    }

    print(get_verification(user))
