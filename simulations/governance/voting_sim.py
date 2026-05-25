import random

def simulate_vote(participants, weight):
    print(f"Simulating DAO governance vote with {participants} voters.")
    turnout = random.uniform(0.4, 0.8)
    print(f"Turnout: {turnout*100:.2f}%")
    return turnout > 0.51

simulate_vote(1000, "PiRC2_weighted")
