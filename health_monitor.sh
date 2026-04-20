#!/bin/bash
echo "🔍 Scanning πRC Matrix Integrity..."
ROOT_ID=$(grep 'L0_Purple' deploy_log.tmp | cut -d'|' -f2)
STATUS=$(soroban contract invoke --id "$ROOT_ID" --source "$PI_SECRET" --rpc-url "$PI_RPC" --network-passphrase "Pi Testnet" -- health_check 2>&1)

if [[ $STATUS == *"true"* ]]; then
    echo "✅ Matrix Status: OPTIMAL"
else
    echo "⚠️ Matrix Status: DEGRADED - Checking Nodes..."
fi
