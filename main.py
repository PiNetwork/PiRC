from fastapi import FastAPI
from models import RWARequest, RWAResponse
from verifier import verify_rwa

app = FastAPI(title="RWA Verification API", version="0.3")

@app.get("/")
def root():
    return {"message": "RWA Verification API is running"}

@app.post("/verify", response_model=RWAResponse)
def verify(data: RWARequest):
    result = verify_rwa(data)
    return result
