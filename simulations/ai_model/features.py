def extract_features(user):
    return [
        user["attention"],
        user["quality"],
        user["behavior"],
        user["session_time"],
        user["interaction_rate"],
    ]
