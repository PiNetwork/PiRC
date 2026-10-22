"""
PiRC3 - database config (Python side)

Mirrors the settings used by db.js so the Python and Node sides of the
database layer stay in sync. Override with environment variables rather
than editing this file directly.
"""

import os
from pathlib import Path

DATABASE_DIR = Path(__file__).resolve().parent

# Same env var name as db.js (PIRC3_DB_PATH) so both sides point at one file.
DB_PATH = Path(os.environ.get("PIRC3_DB_PATH", DATABASE_DIR / "pirc3.db"))

SCHEMA_PATH = DATABASE_DIR / "exchange_schema.sql"

# Design-stage defaults. Review before this is used outside local dev.
PRAGMAS = {
    "journal_mode": "WAL",
    "foreign_keys": "ON",
}


def as_dict():
    """Return the active config as a plain dict (handy for logging/debugging)."""
    return {
        "db_path": str(DB_PATH),
        "schema_path": str(SCHEMA_PATH),
        "pragmas": dict(PRAGMAS),
    }


if __name__ == "__main__":
    import json

    print(json.dumps(as_dict(), indent=2))
