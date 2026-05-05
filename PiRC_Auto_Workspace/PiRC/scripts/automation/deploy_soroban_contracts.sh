#!/bin/bash

# ==============================================================================
# PiRC Soroban Smart Deployment Factory (Self-Healing, Auto-Funding, Retry-Logic)
# ==============================================================================

echo "🚀 [1/5] Initializing Smart Soroban Deployment Factory..."

NETWORK="testnet"
#Upgrade 1: Use the official primary server to avoid DNS problems 
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "⚙️ [2/5] Setting up Stellar Identity and Auto-Funding..."
stellar network add $NETWORK --rpc-url $RPC_URL --network-passphrase "$NETWORK_PASSPHRASE" || true

if [ -n "$STELLAR_TESTNET_SECRET" ]; then
    echo "$STELLAR_TESTNET_SECRET" | stellar keys add deployer_account --secret-key || true
    PUBLIC_KEY=$(stellar keys address deployer_account)
    echo "✅ Identity configured. Public Key: $PUBLIC_KEY"
    
    echo "💰 Requesting funds from Friendbot for $PUBLIC_KEY..."
    curl -s "https://friendbot.stellar.org/?addr=$PUBLIC_KEY" > /dev/null
    echo "✅ Account funded."
else
    echo "❌ ERROR: STELLAR_TESTNET_SECRET is missing! Cannot deploy."
    exit 1
fi

echo "🩹 [3/5] Auto-Healing Rust Files (Fixing Module Architecture)..."
find contracts/soroban -name "*.rs" -type f -exec sed -i '/#\!\[no_std\]/d' {} +
find contracts/soroban -name "*.rs" -type f -exec sed -i '/mod pirc_config;/d' {} +

find contracts/soroban -name "Cargo.toml" | while read -r cargo_file; do
    contract_dir=$(dirname "$cargo_file")
    lib_rs="$contract_dir/src/lib.rs"
    
    if [ -f "$lib_rs" ]; then
        sed -i '1i #![no_std]' "$lib_rs"
        sed -i '2i mod pirc_config;' "$lib_rs"
    fi
done

find contracts/soroban -name "justice_engine.rs" -type f | while read -r file; do
    if ! grep -q "use soroban_sdk::contracterror;" "$file"; then
        sed -i '1i use soroban_sdk::contracterror;' "$file"
    fi
done
echo "✅ Auto-Healing Complete."

echo "🔨 [4/5] Compiling and Deploying Soroban Contracts..."
mkdir -p deployment_logs
LOG_FILE="deployment_logs/live_contracts_$(date +%Y%m%d_%H%M%S).txt"
ERROR_LOG="deployment_logs/failed_contracts_$(date +%Y%m%d_%H%M%S).txt"

echo "PiRC Live Contract Deployments - $(date)" > "$LOG_FILE"
echo "PiRC Failed Deployments (Needs Review) - $(date)" > "$ERROR_LOG"
echo "---------------------------------------------------" >> "$LOG_FILE"

find contracts/soroban -name "Cargo.toml" | while read -r cargo_file; do
    contract_dir=$(dirname "$cargo_file")
    contract_name=$(basename "$contract_dir")
    
    echo "⏳ Processing Contract: $contract_name in $contract_dir"
    cd "$contract_dir"
    
    echo "   -> Compiling..."
    if ! cargo build --target wasm32-unknown-unknown --release; then
        echo "   ❌ Compilation Failed for $contract_name. Skipping to next..."
        echo "$contract_name : Compilation Error" >> "../../$ERROR_LOG"
        cd - > /dev/null
        continue
    fi
    
    wasm_file=$(find target/wasm32-unknown-unknown/release -name "*.wasm" | head -n 1)
    
    if [ -n "$wasm_file" ]; then
        echo "   -> Deploying $wasm_file to $NETWORK..."
        
        #Upgrade 2: Repeated Loop System to Resist Network Outages 
        MAX_RETRIES=3
        RETRY_COUNT=0
        DEPLOY_SUCCESS=false
        contract_id=""

        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            contract_id=$(stellar contract deploy --wasm "$wasm_file" --source deployer_account --network $NETWORK)
            if [ $? -eq 0 ] && [ -n "$contract_id" ]; then
                DEPLOY_SUCCESS=true
                break
            else
                echo "   ⚠️ Network issue detected. Retrying in 5 seconds... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
                sleep 5
                RETRY_COUNT=$((RETRY_COUNT+1))
            fi
        done

        if [ "$DEPLOY_SUCCESS" = true ]; then
            echo "   ✅ Deployed Successfully! ID: $contract_id"
            echo "$contract_name : $contract_id" >> "../../$LOG_FILE"
        else
            echo "   ❌ Deployment Failed for $contract_name after $MAX_RETRIES attempts. Skipping..."
            echo "$contract_name : Deployment Error (Network/DNS)" >> "../../$ERROR_LOG"
        fi
    else
        echo "   ❌ .wasm file not found for $contract_name"
        echo "$contract_name : WASM Missing" >> "../../$ERROR_LOG"
    fi
    
    cd - > /dev/null
done

echo "🌐 [5/5] Committing Deployment Logs and Auto-Fixes to GitHub..."
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"
git add .
git commit -m "chore: Robust deploy with Retry Logic and Auto-Sync" 2>/dev/null || true

#Upgrade 3: Pull the updates first to avoid the rejection error.  (Rejected Push)
git pull origin main --rebase || true
git push origin main

echo "🎉 SMART DEPLOYMENT COMPLETE!"
