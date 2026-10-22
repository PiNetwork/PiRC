"""
security.py — Secrets and environment handling for PiRC.

Responsibilities:
- Load environment variables safely (via python-dotenv in dev, real env vars in prod).
- Fail fast at startup if required secrets are missing or empty.
- Never log or expose secret values.
- Provide small helpers for typed env access and password hashing.

Usage:
    from security import get_settings

    settings = get_settings()
    db_url = settings.database_url
"""

from __future__ import annotations

import logging
import os
import secrets
from dataclasses import dataclass, field
from typing import Optional

try:
    # Only used in local development; in production real env vars should be
    # injected by the platform (systemd, Docker, CI/CD secrets, etc).
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

# Names of secrets that must be present and non-empty for the app to start.
# Keep this list in sync with REQUIRED_SECRETS in .env.example.
DEFAULT_REQUIRED_SECRETS = ("SECRET_KEY", "DB_PASSWORD")


class MissingSecretError(RuntimeError):
    """Raised when a required secret is missing or empty at startup."""


def _get_env(name: str, default: Optional[str] = None, required: bool = False) -> Optional[str]:
    """Read an environment variable without ever logging its value."""
    value = os.environ.get(name, default)
    if required and (value is None or value.strip() == ""):
        raise MissingSecretError(
            f"Required environment variable '{name}' is missing or empty. "
            f"Check your .env file against .env.example."
        )
    return value


def _get_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


def _get_int(name: str, default: int) -> int:
    value = os.environ.get(name)
    if value is None or value.strip() == "":
        return default
    try:
        return int(value)
    except ValueError:
        raise RuntimeError(f"Environment variable '{name}' must be an integer, got: {value!r}")


@dataclass(frozen=True)
class Settings:
    app_env: str
    debug: bool
    secret_key: str

    db_engine: str
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str
    db_ssl_mode: str
    database_url: Optional[str]

    password_hash_rounds: int
    jwt_secret: str
    jwt_expiry_minutes: int

    def __repr__(self) -> str:
        # Explicitly avoid leaking secret fields if this object is ever
        # printed or logged (e.g. by an uncaught exception traceback).
        redacted = {
            "app_env": self.app_env,
            "debug": self.debug,
            "db_engine": self.db_engine,
            "db_host": self.db_host,
            "db_port": self.db_port,
            "db_name": self.db_name,
            "db_user": self.db_user,
            "db_ssl_mode": self.db_ssl_mode,
        }
        return f"Settings({redacted}, secret_key='***', db_password='***', jwt_secret='***')"


def validate_required_secrets(names: tuple[str, ...] = DEFAULT_REQUIRED_SECRETS) -> None:
    """
    Raise MissingSecretError listing *all* missing secrets at once, rather
    than failing on the first one — this makes fixing a fresh .env faster.
    """
    missing = [name for name in names if not os.environ.get(name, "").strip()]
    if missing:
        raise MissingSecretError(
            "Missing required secret(s): " + ", ".join(missing) +
            ". Check your .env file against .env.example."
        )


def get_settings() -> Settings:
    """
    Build and validate application settings from environment variables.
    Call this once at startup; fail fast if anything required is missing.
    """
    required_env = os.environ.get("REQUIRED_SECRETS")
    required_names = tuple(n.strip() for n in required_env.split(",")) if required_env else DEFAULT_REQUIRED_SECRETS
    validate_required_secrets(required_names)

    settings = Settings(
        app_env=_get_env("APP_ENV", default="development"),
        debug=_get_bool("DEBUG", default=False),
        secret_key=_get_env("SECRET_KEY", required=True),
        db_engine=_get_env("DB_ENGINE", default="postgresql"),
        db_host=_get_env("DB_HOST", default="localhost"),
        db_port=_get_int("DB_PORT", default=5432),
        db_name=_get_env("DB_NAME", default="pirc"),
        db_user=_get_env("DB_USER", default="pirc_app"),
        db_password=_get_env("DB_PASSWORD", required=True),
        db_ssl_mode=_get_env("DB_SSL_MODE", default="require"),
        database_url=_get_env("DATABASE_URL", default=None),
        password_hash_rounds=_get_int("PASSWORD_HASH_ROUNDS", default=12),
        jwt_secret=_get_env("JWT_SECRET", required=True) if os.environ.get("JWT_SECRET") else _get_env("SECRET_KEY"),
        jwt_expiry_minutes=_get_int("JWT_EXPIRY_MINUTES", default=60),
    )

    if settings.app_env == "production" and settings.debug:
        raise RuntimeError("DEBUG must not be true when APP_ENV=production.")

    if settings.app_env == "production" and settings.db_ssl_mode == "disable":
        logger.warning(
            "DB_SSL_MODE is 'disable' in a production environment. "
            "This is insecure — database traffic will not be encrypted."
        )

    return settings


def get_database_url(settings: Settings) -> str:
    """
    Return a single connection string, preferring an explicit DATABASE_URL
    if one was provided, otherwise building it from the individual DB_* vars.
    """
    if settings.database_url:
        return settings.database_url

    driver = "postgresql+psycopg2" if settings.db_engine == "postgresql" else "mysql+pymysql"
    return (
        f"{driver}://{settings.db_user}:{settings.db_password}"
        f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )


def generate_secret(length_bytes: int = 64) -> str:
    """Generate a cryptographically secure random secret for SECRET_KEY/JWT_SECRET."""
    return secrets.token_urlsafe(length_bytes)


__all__ = [
    "Settings",
    "MissingSecretError",
    "get_settings",
    "get_database_url",
    "validate_required_secrets",
    "generate_secret",
]
