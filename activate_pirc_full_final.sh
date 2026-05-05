#!/usr/bin/env bash
# PiRC Sovereign Master Orchestrator (vFinal) — safe activation wrapper.
#
# Loads .env if present, validates environment, prints the read-only on-chain
# status of the Master Issuer (GA3E…NEN6) and the PiRC2 Subscription contract
# (CCUF…PFYV) on Pi Testnet via public Horizon and Soroban RPC.
#
# This script intentionally does NOT:
#   - perform git auto-merge / force-push / autonomous PR creation
#   - touch Mainnet
#   - print or transmit any secret values
# Those operations remain manual on purpose.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

if [ -f ".env" ]; then
  set -o allexport
  # shellcheck disable=SC1091
  . ./.env
  set +o allexport
fi

PYTHON_BIN="${PYTHON_BIN:-python3}"

echo "▶ PiRC vFinal — env validation"
"$PYTHON_BIN" pi_rc_master_orchestrator_final.py validate-env

echo
echo "▶ PiRC vFinal — public on-chain status"
"$PYTHON_BIN" pi_rc_master_orchestrator_final.py status
