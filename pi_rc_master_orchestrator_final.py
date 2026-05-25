#!/usr/bin/env python3
"""
PiRC Sovereign Master Orchestrator (vFinal) — read-only status driver.

This script is intentionally scoped:

* It loads env vars (STELLAR_TESTNET_SECRET, PI_API_KEY, OMNI_SYNC_TOKEN, …)
but NEVER prints, logs, or transmits their values.
* It only performs PUBLIC reads against Pi Testnet Horizon and Soroban RPC.
* It does NOT perform git auto-merges, force-pushes, autonomous PR creation,
cross-network mainnet writes, or "self-healing" overwrites — those patterns
are explicitly out of scope because they cannot be made safe inside a single
automated agent run.

Run:
python pi_rc_master_orchestrator_final.py status
python pi_rc_master_orchestrator_final.py validate-env

Exits non-zero on any failed public check so CI can gate on it.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any

PIRC_MASTER_ISSUER = "GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
PIRC2_SUBSCRIPTION_CONTRACT = "CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV"

HORIZON = os.environ.get("STELLAR_HORIZON_URL", "https://api.testnet.minepi.com")
SOROBAN = os.environ.get("SOROBAN_RPC_URL", "https://soroban-testnet.stellar.org:443")

PACKETS = [
("RED",    "Governance",  "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"),
("GREEN",  "Pi Cash",     "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4"),
("ORANGE", "Register",    "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF"),
("YELLOW", "Subscribe",   "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF"),
("BLUE",   "Extend",      "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD"),
("PURPLE", "Pay Upfront", "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4"),
("GOLD",   "Status",      "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG"),
]


def _get(url: str, timeout: float = 8.0) -> dict[str, Any]:
req = urllib.request.Request(url, headers={"Accept": "application/json"})
with urllib.request.urlopen(req, timeout=timeout) as r:
return json.loads(r.read().decode("utf-8"))


def _rpc(url: str, method: str, params: dict | None = None, timeout: float = 8.0) -> dict[str, Any]:
payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode()
req = urllib.request.Request(
url, data=payload, headers={"Content-Type": "application/json", "Accept": "application/json"}
)
with urllib.request.urlopen(req, timeout=timeout) as r:
return json.loads(r.read().decode("utf-8"))


def cmd_validate_env() -> int:
"""Confirm env vars are wired without printing their values."""
flags = {
"STELLAR_TESTNET_SECRET": bool(os.environ.get("STELLAR_TESTNET_SECRET")),
"PI_API_KEY": bool(os.environ.get("PI_API_KEY")),
"OMNI_SYNC_TOKEN": bool(os.environ.get("OMNI_SYNC_TOKEN")),
}
secret = os.environ.get("STELLAR_TESTNET_SECRET", "")
if secret and not secret.startswith("S"):
print("WARN: STELLAR_TESTNET_SECRET does not start with 'S' — likely malformed.", file=sys.stderr)
print(json.dumps({"env_present": flags}, indent=2))
return 0


def cmd_status() -> int:
out: dict[str, Any] = {
"master_issuer": PIRC_MASTER_ISSUER,
"pirc2_subscription": PIRC2_SUBSCRIPTION_CONTRACT,
"packets": [{"color": c, "role": r, "contract": cid} for c, r, cid in PACKETS],
}
rc = 0

try:
acc = _get(f"{HORIZON}/accounts/{PIRC_MASTER_ISSUER}")
out["issuer"] = {
"id": acc.get("account_id"),
"sequence": acc.get("sequence"),
"subentry_count": acc.get("subentry_count"),
"balance_count": len(acc.get("balances", [])),
}
except (urllib.error.URLError, urllib.error.HTTPError, ValueError) as e:
out["issuer_error"] = str(e)
rc = 1

for method in ("getLatestLedger", "getNetwork"):
try:
res = _rpc(SOROBAN, method)
out[method] = res.get("result", res)
except (urllib.error.URLError, urllib.error.HTTPError, ValueError) as e:
out[f"{method}_error"] = str(e)
rc = 1

print(json.dumps(out, indent=2, sort_keys=True))
return rc


COMMANDS = {
"status": cmd_status,
"validate-env": cmd_validate_env,
}


def main(argv: list[str]) -> int:
cmd = argv[1] if len(argv) > 1 else "status"
fn = COMMANDS.get(cmd)
if fn is None:
print(f"Unknown command: {cmd}\nAvailable: {', '.join(COMMANDS)}", file=sys.stderr)
return 2
return fn()


if __name__ == "__main__":
sys.exit(main(sys.argv))
