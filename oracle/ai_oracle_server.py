from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("simulations/ai_model/ai_verification_model.pkl")


@app.post("/verify")
def verify(user: dict):
    features = np.array([[
        user["attention"],
        user["quality"],
        user["behavior"],
        user["session_time"],
        user["interaction_rate"]
    ]])

    prob = model.predict_proba(features)[0][1]

    return {
        "verification_score": float(prob)
    }
