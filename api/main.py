from fastapi import FastAPI
import subprocess
import json
import re

app = FastAPI()

CONTRACT_ID = "ISI_DENGAN_CONTRACT_ID_KAMU"

# Allow only a restricted set of characters in command-line arguments that come from the user.
# This prevents passing values containing whitespace, control characters, or shell-like metacharacters.
_SAFE_ARG_PATTERN = re.compile(r"^[A-Za-z0-9_\-:+=/]+$")


def _validate_verify_input(data: dict) -> dict:
    """
    Validate and sanitize input for the /verify endpoint before it is passed
    as arguments to the external 'soroban' process.
    """
    required_fields = ("pid", "issuer_pubkey", "signature", "chip_uid")
    validated: dict = {}

    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
        value = str(data[field])
        # Basic length limits to avoid abuse and overly long command-line arguments.
        if not (1 <= len(value) <= 256):
            raise ValueError(f"Invalid length for field: {field}")
        # Enforce a conservative allow-list of characters.
        if not _SAFE_ARG_PATTERN.match(value):
            raise ValueError(f"Invalid characters in field: {field}")
        validated[field] = value

    return validated


@app.get("/")
def root():
    return {"status": "RWA Verification API LIVE"}

@app.post("/verify")
def verify(data: dict):
    try:
        validated = _validate_verify_input(data)

        cmd = [
            "soroban", "contract", "invoke",
            "--id", CONTRACT_ID,
            "--network", "testnet",
            "--source", "alice",
            "--",
            "verify",
            "--pid", validated["pid"],
            "--issuer_pubkey", validated["issuer_pubkey"],
            "--signature", validated["signature"],
            "--chip_uid", validated["chip_uid"]
        ]

        result = subprocess.check_output(cmd).decode()

        return {
            "status": "success",
            "onchain_result": result
        }

    except Exception as e:
        return {"error": str(e)}
