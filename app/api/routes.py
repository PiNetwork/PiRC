from fastapi import APIRouter
from app.models.schema import RWARequest, RWAResponse
from app.services.verifier import verify_offchain
from app.services.soroban import verify_onchain
from app.utils.cache import get_cache, set_cache

router = APIRouter()

@router.post("/verify", response_model=RWAResponse)
async def verify(data: RWARequest):

    cache_key = f"{data.pid}"
    cached = get_cache(cache_key)

    if cached:
        return eval(cached)

    valid, score = verify_offchain(data)
    onchain = await verify_onchain(data.pid)

    result = {
        "status": "AUTHENTIC" if valid else "COUNTERFEIT",
        "confidence": score,
        "onchain_verified": onchain
    }

    set_cache(cache_key, str(result))
    return result
