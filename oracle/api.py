from fastapi import FastAPI
from relayer import process_user

app = FastAPI()

@app.post("/process")
def process(data: dict):
    user = data["user"]
    address = data["address"]

    result = process_user(user, address)

    return result


from nacl.signing import VerifyKey
import base64

def verify_signature(address, message, signature):
    try:
        verify_key = VerifyKey(bytes.fromhex(address))
        verify_key.verify(message.encode(), base64.b64decode(signature))
        return True
    except:
        return False
