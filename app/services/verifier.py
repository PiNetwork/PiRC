from app.core.security import verify_signature

def verify_offchain(data):
    valid = verify_signature(
        data.pid,
        data.issuer_pubkey,
        data.signature
    )

    score = 0
    if valid:
        score += 70
    if data.chip_uid:
        score += 30

    return valid, score
