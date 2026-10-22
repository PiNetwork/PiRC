"""
PiRC3 - database CLI (Python side)

A small command-line entry point for inspecting/seeding the off-chain
exchange log without going through the Node API. Useful for local dev
and for the Python-side validation tooling in service/pirc3_validate.py.

Usage:
    python3 database/main.py init
    python3 database/main.py seed-swap --tx-hash 0xabc... --log-index 0 \
        --block-number 123 --user 0xuser... --token-in 0xtoken... \
        --amount-in 1000 --amount-out 995 --exchange 0xexchange...
    python3 database/main.py list-swaps [--limit 20]
    python3 database/main.py list-liquidity [--limit 20]
    python3 database/main.py stats
"""

import argparse
import json
import sys

import config
import init as db_init


def cmd_init(_args):
    db_init.initialize_schema()
    print(f"Schema applied to {config.DB_PATH}")


def cmd_seed_swap(args):
    conn = db_init.init_db()
    try:
        conn.execute(
            """
            INSERT OR IGNORE INTO exchange_swaps
                (tx_hash, log_index, block_number, user_address, token_in,
                 amount_in, amount_out, exchange_addr)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                args.tx_hash,
                args.log_index,
                args.block_number,
                args.user,
                args.token_in,
                args.amount_in,
                args.amount_out,
                args.exchange,
            ),
        )
        conn.commit()
        print("Inserted (or already present):", args.tx_hash, args.log_index)
    finally:
        conn.close()


def cmd_list_swaps(args):
    conn = db_init.init_db()
    try:
        rows = conn.execute(
            "SELECT * FROM exchange_swaps ORDER BY id DESC LIMIT ?",
            (args.limit,),
        ).fetchall()
        print(json.dumps([dict(r) for r in rows], indent=2))
    finally:
        conn.close()


def cmd_list_liquidity(args):
    conn = db_init.init_db()
    try:
        rows = conn.execute(
            "SELECT * FROM exchange_liquidity_events ORDER BY id DESC LIMIT ?",
            (args.limit,),
        ).fetchall()
        print(json.dumps([dict(r) for r in rows], indent=2))
    finally:
        conn.close()


def cmd_stats(_args):
    conn = db_init.init_db()
    try:
        swaps = conn.execute("SELECT COUNT(*) AS n FROM exchange_swaps").fetchone()["n"]
        liquidity = conn.execute(
            "SELECT COUNT(*) AS n FROM exchange_liquidity_events"
        ).fetchone()["n"]
        print(json.dumps({"swaps": swaps, "liquidity_events": liquidity}, indent=2))
    finally:
        conn.close()


def build_parser():
    parser = argparse.ArgumentParser(description="PiRC3 database CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="Create/upgrade the sqlite schema").set_defaults(func=cmd_init)

    seed = sub.add_parser("seed-swap", help="Insert one demo/real swap row")
    seed.add_argument("--tx-hash", required=True)
    seed.add_argument("--log-index", type=int, required=True)
    seed.add_argument("--block-number", type=int, required=True)
    seed.add_argument("--user", required=True, dest="user")
    seed.add_argument("--token-in", required=True)
    seed.add_argument("--amount-in", required=True)
    seed.add_argument("--amount-out", required=True)
    seed.add_argument("--exchange", required=True)
    seed.set_defaults(func=cmd_seed_swap)

    list_swaps = sub.add_parser("list-swaps", help="List recent swaps")
    list_swaps.add_argument("--limit", type=int, default=20)
    list_swaps.set_defaults(func=cmd_list_swaps)

    list_liquidity = sub.add_parser("list-liquidity", help="List recent liquidity events")
    list_liquidity.add_argument("--limit", type=int, default=20)
    list_liquidity.set_defaults(func=cmd_list_liquidity)

    sub.add_parser("stats", help="Row counts for both tables").set_defaults(func=cmd_stats)

    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    sys.exit(main() or 0)
