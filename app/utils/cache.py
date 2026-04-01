import redis
from app.core.config import settings

r = redis.Redis.from_url(settings.REDIS_URL)

def get_cache(key):
    val = r.get(key)
    return val

def set_cache(key, value):
    r.setex(key, 300, value)
