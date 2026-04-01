from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

app.include_router(router)

@app.get("/")
def root():
    return {"status": "RWA API running"}
