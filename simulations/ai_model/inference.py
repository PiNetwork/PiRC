import joblib
import numpy as np

model = joblib.load("ai_verification_model.pkl")

def predict_verification(user):
    features = np.array([[
        user["attention"],
        user["quality"],
        user["behavior"],
        user["session_time"],
        user["interaction_rate"]
    ]])

    prob = model.predict_proba(features)[0][1]  # probability human

    return prob
