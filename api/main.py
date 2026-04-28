from fastapi import FastAPI
import subprocess
import json

app = FastAPI()

CONTRACT_ID = "ISI_DENGAN_CONTRACT_ID_KAMU"

@app.get("/")
def root():
    return {"status": "RWA Verification API LIVE"}

@app.post("/verify")
def verify(data: dict):
    try:
        cmd = [
            "soroban", "contract", "invoke",
            "--id", CONTRACT_ID,
            "--network", "testnet",
            "--source", "alice",
            "--",
            "verify",
            "--pid", data["pid"],
            "--issuer_pubkey", data["issuer_pubkey"],
            "--signature", data["signature"],
            "--chip_uid", data["chip_uid"]
        ]

        result = subprocess.check_output(cmd).decode()

        return {
            "status": "success",
            "onchain_result": result
        }

    except Exception as e:
        return {"error": str(e)}
