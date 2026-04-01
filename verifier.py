import base64
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

def verify_signature(pid: str, pubkey: str, signature: str):
    try:
        verify_key = VerifyKey(base64.b64decode(pubkey))
        verify_key.verify(pid.encode(), base64.b64decode(signature))
        return True
    except BadSignatureError:
        return False
    except Exception:
        return False


def verify_rwa(data):
    is_valid = verify_signature(
        data.pid,
        data.issuer_pubkey,
        data.signature
    )

    confidence = 0

    if is_valid:
        confidence += 70

    if data.chip_uid:
        confidence += 30

    return {
        "status": "AUTHENTIC" if is_valid else "COUNTERFEIT",
        "confidence": confidence
    }
