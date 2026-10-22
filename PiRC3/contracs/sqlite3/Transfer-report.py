"""
PiRC3 - Transfer report (Python)

Reads the `safetransfer_log` table (ERC20, BEP20 and SPL) and prints
per-chain totals, and computes net balances per address. uint256 amounts are stored as strings, so
Python's arbitrary-precision int is used (no float rounding).

Usage: python utils/transfer_report.py [path/to/pirc3.db]
"""
import sqlite3
import sys
from collections import defaultdict

def net_balances(db_path: str, chain: str, token: str) -> dict:
    """Net balance per address derived from logged transfers (mints/burns included)."""
    balances = defaultdict(int)
    conn = sqlite3.connect(db_path)
    try:
        rows = conn.execute(
            "SELECT from_address, to_address, amount FROM safetransfer_log "
            "WHERE chain = ? AND token_address = ?",
            # EVM addresses are stored lowercase; Solana base58 is case-sensitive
            (chain, token.lower() if token.startswith("0x") else token),
        )
        for sender, receiver, amount in rows:
            value = int(amount)
            balances[sender] -= value
            balances[receiver] += value
    finally:
        conn.close()
    return dict(balances)

def summary(db_path: str) -> None:
    conn = sqlite3.connect(db_path)
    try:
        for chain, standard, token, n in conn.execute(
            "SELECT chain, standard, token_address, COUNT(*) "
            "FROM safetransfer_log GROUP BY chain, standard, token_address"
        ):
            print(f"{chain:10} {standard:6} {token}  transfers={n}")
    finally:
        conn.close()

if __name__ == "__main__":
    summary(sys.argv[1] if len(sys.argv) > 1 else "pirc3.db")
