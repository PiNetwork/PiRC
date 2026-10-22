"""
PiRC3 - database init (Python side)

Opens the sqlite file used by the off-chain exchange log and applies
exchange_schema.sql. This is the Python-side equivalent of db.js's
getDb(); use whichever side (Node or Python) fits the calling code,
they operate on the same sqlite file.

Run directly to initialize/upgrade the schema without touching any rows:
    python3 database/init.py
"""

import sqlite3

import config


def get_connection():
    """Open a connection to the PiRC3 sqlite file, applying pragmas from config."""
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    for pragma, value in config.PRAGMAS.items():
        conn.execute(f"PRAGMA {pragma} = {value}")
    return conn


def initialize_schema(conn=None):
    """Apply exchange_schema.sql (idempotent: CREATE TABLE/INDEX IF NOT EXISTS)."""
    owns_conn = conn is None
    conn = conn or get_connection()
    try:
        schema_sql = config.SCHEMA_PATH.read_text()
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        if owns_conn:
            conn.close()


def init_db():
    """Convenience: open a connection, make sure the schema exists, return the connection."""
    conn = get_connection()
    initialize_schema(conn)
    return conn


if __name__ == "__main__":
    initialize_schema()
    print(f"PiRC3 schema applied to {config.DB_PATH}")
