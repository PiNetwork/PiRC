import random

def ai_verification_score(attention, quality, behavior_score):
    """
    Simulate AI-based human verification
    """

    # heuristic scoring
    score = (
        0.4 * (attention / 10) +
        0.4 * quality +
        0.2 * behavior_score
    )

    # clamp 0–1
    return max(0, min(1, score))


def detect_bot_pattern(attention, quality):
    if attention > 12 and quality < 0.4:
        return True
    return False


def generate_user():
    is_bot = random.random() < 0.3

    if is_bot:
        attention = random.uniform(8, 15)
        quality = random.uniform(0.1, 0.5)
        behavior = random.uniform(0.1, 0.3)
    else:
        attention = random.uniform(2, 10)
        quality = random.uniform(0.6, 1.2)
        behavior = random.uniform(0.6, 1.0)

    verification = ai_verification_score(attention, quality, behavior)

    return {
        "attention": attention,
        "quality": quality,
        "verification": verification,
        "is_bot": is_bot
    }
