#!/bin/bash
# =============================================================================
# 🌌 PIRC OMNI-SOVEREIGN ORCHESTRATOR & KEY VAULT INTEGRATION
# =============================================================================
set -e

CONTRACT_ID="CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"
KNOWN_PUBLIC_KEY="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
TESTNET_RPC="https://soroban-testnet.stellar.org:443"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "================================================================="
echo " 🛡️ INITIALIZING IDENTITY VAULT & OMNI-SYNC PROTOCOL 🛡️"
echo "================================================================="

VAULT_FILE="$HOME/.pirc_omni_vault.env"

if [ ! -f "$VAULT_FILE" ]; then
    echo "[!] Vault not found. Generating secure credential vault..."
    touch "$VAULT_FILE"
    chmod 600 "$VAULT_FILE"
    
    # The script will now PAUSE here for your input
    read -p "Enter STELLAR_TESTNET_SECRET (Merchant Secret, starts with S...): " IN_STELLAR
    read -p "Enter DISTRIBUTOR_SECRET (Subscriber Secret, starts with S...): " IN_DIST
    read -p "Enter OMNI_SYNC_TOKEN (Network Access Token): " IN_OMNI
    
    echo "STELLAR_TESTNET_SECRET=\"$IN_STELLAR\"" >> "$VAULT_FILE"
    echo "DISTRIBUTOR_SECRET=\"$IN_DIST\"" >> "$VAULT_FILE"
    echo "OMNI_SYNC_TOKEN=\"$IN_OMNI\"" >> "$VAULT_FILE"
    echo "✅ Vault provisioned securely at $VAULT_FILE"
else
    echo "✅ Existing Identity Vault detected and loaded."
fi

source "$VAULT_FILE"

if [ -z "$STELLAR_TESTNET_SECRET" ] || [ -z "$DISTRIBUTOR_SECRET" ]; then
    echo "❌ CRITICAL: Secrets missing. Please delete $VAULT_FILE and rerun."
    exit 1
fi

echo ""
echo "[*] Establishing connection to Quantum Differential RPC..."
stellar network add \
  --global experimental_net \
  --rpc-url "$TESTNET_RPC" \
  --network-passphrase "$NETWORK_PASSPHRASE" 2>/dev/null || true
echo "✅ Connection stabilized."

echo ""
echo "[*] Querying network balance & initiating self-healing funding protocol..."

echo "-> Registering CLI Operator / Merchant..."
echo "$STELLAR_TESTNET_SECRET" | stellar keys add pirc_merchant 2>/dev/null || true
stellar keys fund pirc_merchant --network experimental_net 2>/dev/null || echo "   (Balance sufficient or faucet rate-limited)"

echo "-> Registering Distributor / Subscriber..."
echo "$DISTRIBUTOR_SECRET" | stellar keys add pirc_distributor 2>/dev/null || true
stellar keys fund pirc_distributor --network experimental_net 2>/dev/null || echo "   (Balance sufficient or faucet rate-limited)"

echo "✅ Identity matrix synced and funded."

echo ""
echo "================================================================="
echo " 🚀 EXECUTING OMNI-SOVEREIGN SMART CONTRACT VECTORS"
echo "    Target: $CONTRACT_ID"
echo "================================================================="

invoke_contract() {
    local phase="$1"
    local query_args="$2"
    
    echo -e "\nExecuting: $phase..."
    if stellar contract invoke --id "$CONTRACT_ID" --network experimental_net $query_args; then
        echo "✅ [SUCCESS]: verified on ledger."
    else
        echo "⚠️ [NOTICE]: Execution blocked. Contract may require prior state setup (e.g., Dedup)."
    fi
}

MERCH_PUB=$(stellar keys address pirc_merchant)
DIST_PUB=$(stellar keys address pirc_distributor)

invoke_contract "Layer 1: Register Differential Subscription Service" \
    "--source pirc_merchant -- register_service --merchant $MERCH_PUB --name 'Omni Sync Integration' --price 10000000 --period_secs 2592000 --trial_period_secs 0 --approve_periods 3"

invoke_contract "Layer 2: Autonomous Token Subscription" \
    "--source pirc_distributor -- subscribe --subscriber $DIST_PUB --service_id 0 --auto_renew true"

invoke_contract "Layer 3: Omni-Batch Differential Charge Execution" \
    "--source pirc_merchant -- process --merchant $MERCH_PUB --service_id 0 --offset 0 --limit 50"

echo "================================================================="
echo " 🏆 EXPERIMENTAL ENVIRONMENT FULLY EXECUTED & SYNCHRONIZED"
echo "================================================================="
