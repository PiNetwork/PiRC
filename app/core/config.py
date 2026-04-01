import os

class Settings:
    APP_NAME = "RWA Verification API"
    VERSION = "1.0.0"

    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    SOROBAN_RPC = os.getenv("SOROBAN_RPC", "https://soroban-testnet.stellar.org")
    CONTRACT_ID = os.getenv("CONTRACT_ID", "")

settings = Settings()
