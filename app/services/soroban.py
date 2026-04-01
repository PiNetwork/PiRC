import httpx
from app.core.config import settings

async def verify_onchain(pid: str):
    if not settings.CONTRACT_ID:
        return False

    # Simplified RPC call mock (can be replaced with real soroban invoke)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(settings.SOROBAN_RPC)
        return True
    except:
        return False
