#!/bin/bash
# =====================================================
# PiDEX Sovereign Matrix - ALL ENVIRONMENTS FULL SETUP
# =====================================================

set -e
echo "=========================================================="
echo "🚀 PiDEX MATRIX - ALL ENVIRONMENTS DEPLOYMENT"
echo "=========================================================="

pkg update -y && pkg install -y git curl

if [ ! -d ".git" ]; then
    echo "⚠️ Not inside a Git repository. Make sure you are in ~/PiRC"
    exit 1
fi

echo "[1] Pulling latest changes cleanly..."
git pull origin main -s recursive -X ours --no-edit >/dev/null 2>&1

mkdir -p configs/symbols configs/layers

CORE_ID="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"

LAYERS=(
  "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4|Purple|L0"
  "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG|Gold|L1"
  "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF|Yellow|L2"
  "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF|Orange|L3"
  "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD|Blue|L4"
  "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4|Green|L5"
  "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO|Red|L6"
)

echo "[2] Rebuilding Dynamic Configurations..."
for entry in "${LAYERS[@]}"; do
    IFS='|' read -r CONTRACT COLOR LAYER <<< "$entry"
    echo "   -> Layer: $LAYER ($COLOR)"
    
    cat > "configs/symbols/${LAYER}_${COLOR}_RECEIVE.json" << JSON_RCV
{ "layer": "${LAYER}", "color": "${COLOR}", "contract_id": "${CONTRACT}", "mode": "RECEIVE", "pi_locked": 100, "market_price": 2, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
JSON_RCV

    cat > "configs/symbols/${LAYER}_${COLOR}_PAYMENT.json" << JSON_PAY
{ "layer": "${LAYER}", "color": "${COLOR}", "contract_id": "${CONTRACT}", "mode": "PAYMENT", "pi_locked": 0, "market_price": 1, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
JSON_PAY

    cat > "configs/symbols/${LAYER}_${COLOR}_GENERAL.json" << JSON_GEN
{ "layer": "${LAYER}", "color": "${COLOR}", "contract_id": "${CONTRACT}", "mode": "GENERAL", "pi_locked": 50, "market_price": 1, "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
JSON_GEN
done

echo "[3] Core Manifest Synced."
cat > configs/manifest.json << MANIFEST
{
  "project": "PiDEX Sovereign Matrix",
  "master_core": "${CORE_ID}",
  "capabilities": ["RECEIVE", "PAYMENT", "GENERAL"],
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
MANIFEST

git add auto_setup_all.sh configs/
git commit -m "chore: Added deployment script and dynamic configs" >/dev/null 2>&1 || true
git push origin main --force

echo "=========================================================="
echo "🎉 SYNC COMPLETE! (Clean and ready)"
echo "=========================================================="
