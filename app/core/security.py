import base64
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

def verify_signature(pid: str, pubkey: str, signature: str) -> bool:
    try:
        vk = VerifyKey(base64.b64decode(pubkey))
        vk.verify(pid.encode(), base64.b64decode(signature))
        return True
    except (BadSignatureError, Exception):
        return False
