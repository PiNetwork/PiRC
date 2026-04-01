from pydantic import BaseModel

class RWARequest(BaseModel):
    pid: str
    issuer_pubkey: str
    signature: str
    chip_uid: str | None = None

class RWAResponse(BaseModel):
    status: str
    confidence: int
