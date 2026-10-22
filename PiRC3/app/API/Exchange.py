"""
PiRC3 - exchange blueprint (Python side)

HTTP access to the off-chain exchange log (exchange_swaps,
exchange_liquidity_events) defined in database/exchange_schema.sql.
Uses the same database/config.py + database/init.py that database/main.py
does, so this and the CLI (and db.js on the Node side) all read/write the
same sqlite file.

Routes (mounted at /api/exchange by init.py):
    GET  /swaps           list recent swaps
    POST /swaps           record a swap
    GET  /liquidity       list recent liquidity events
    POST /liquidity       record a liquidity event
    GET  /stats           row counts for both tables
"""

import importlib.util
import os
import sys

from flask import Blueprint, jsonify, request

bp = Blueprint("exchange", __name__)

_DATABASE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database"
)

# database/init.py does a plain `import config`, assuming database/ is on
# sys.path (true when it's run as `python3 database/main.py`). Add it here
# too so the same file works when loaded from Api/ instead.
if _DATABASE_DIR not in sys.path:
    sys.path.insert(0, _DATABASE_DIR)


def _load_module(module_name, filename):
    """Load database/<filename> by path under a distinct module name, so it
    never collides with Api/init.py even though both files are named init.py."""
    spec = importlib.util.spec_from_file_location(
        module_name, os.path.join(_DATABASE_DIR, filename)
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_db_init = _load_module("pirc3_database_init", "init.py")

SWAP_FIELDS = [
    "tx_hash",
    "log_index",
    "block_number",
    "user_address",
    "token_in",
    "amount_in",
    "amount_out",
    "exchange_addr",
]

LIQUIDITY_FIELDS = [
    "tx_hash",
    "log_index",
    "block_number",
    "event_type",
    "token_address",
    "recipient",
    "amount",
]


def _missing_fields(data, required):
    return [f for f in required if data.get(f) in (None, "")]


@bp.get("/swaps")
def list_swaps():
    limit = request.args.get("limit", 20, type=int)
    conn = _db_init.init_db()
    try:
        rows = conn.execute(
            "SELECT * FROM exchange_swaps ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@bp.post("/swaps")
def record_swap():
    data = request.get_json(force=True, silent=True) or {}
    missing = _missing_fields(data, SWAP_FIELDS)
    if missing:
        return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400

    conn = _db_init.init_db()
    try:
        cur = conn.execute(
            """
            INSERT OR IGNORE INTO exchange_swaps
                (tx_hash, log_index, block_number, user_address, token_in,
                 amount_in, amount_out, exchange_addr)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            tuple(data[f] for f in SWAP_FIELDS),
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"inserted": False, "reason": "duplicate (tx_hash, log_index)"}), 200
        return jsonify({"inserted": True, "id": cur.lastrowid}), 201
    except Exception as exc:  # noqa: BLE001 - surface as a 400, keep the API resilient
        return jsonify({"error": str(exc)}), 400
    finally:
        conn.close()


@bp.get("/liquidity")
def list_liquidity():
    limit = request.args.get("limit", 20, type=int)
    conn = _db_init.init_db()
    try:
        rows = conn.execute(
            "SELECT * FROM exchange_liquidity_events ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()


@bp.post("/liquidity")
def record_liquidity():
    data = request.get_json(force=True, silent=True) or {}
    required = [f for f in LIQUIDITY_FIELDS if f != "recipient"]  # recipient is optional
    missing = _missing_fields(data, required)
    if missing:
        return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400
    if data.get("event_type") not in ("added", "removed"):
        return jsonify({"error": "event_type must be 'added' or 'removed'"}), 400

    conn = _db_init.init_db()
    try:
        cur = conn.execute(
            """
            INSERT OR IGNORE INTO exchange_liquidity_events
                (tx_hash, log_index, block_number, event_type, token_address, recipient, amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["tx_hash"],
                data["log_index"],
                data["block_number"],
                data["event_type"],
                data["token_address"],
                data.get("recipient"),
                data["amount"],
            ),
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"inserted": False, "reason": "duplicate (tx_hash, log_index)"}), 200
        return jsonify({"inserted": True, "id": cur.lastrowid}), 201
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 400
    finally:
        conn.close()


@bp.get("/stats")
def stats():
    conn = _db_init.init_db()
    try:
        swaps = conn.execute("SELECT COUNT(*) AS n FROM exchange_swaps").fetchone()["n"]
        liquidity = conn.execute(
            "SELECT COUNT(*) AS n FROM exchange_liquidity_events"
        ).fetchone()["n"]
        return jsonify({"swaps": swaps, "liquidity_events": liquidity})
    finally:
        conn.close()
