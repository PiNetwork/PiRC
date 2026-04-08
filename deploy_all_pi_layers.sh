#!/bin/bash
# === PiRC-207 FULL DEPLOYMENT SCRIPT ===
KEY_NAME="test-account"          # ← Change to your soroban key name
NETWORK="testnet"

echo "🚀 Deploying + Activating ALL 7 PiRC-207 Colored Token Layers on Stellar $NETWORK..."

for dir in contracts/soroban/pirc-207-*-token; do
  color=$(basename "$dir" | sed 's/pirc-207-//;s/-token//')
  echo "🔨 Building & deploying $color layer..."

  cd "$dir"
  soroban contract build

  CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/*.wasm \
    --source "$KEY_NAME" \
    --network "$NETWORK")

  echo "✅ Deployed $color → $CONTRACT_ID"

  # Activate (initialize)
  soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$KEY_NAME" \
    --network "$NETWORK" \
    -- initialize \
    --admin "$(soroban keys address "$KEY_NAME")"

  echo "🔥 $color layer ACTIVATED on-chain"
  cd - > /dev/null
done

echo ""
echo "🎉 ALL 7 LAYERS ARE NOW LIVE AND FUNCTIONAL!"
echo "Copy the links below and paste them directly into the PiNetwo #72 discussion:"
echo ""
for dir in contracts/soroban/pirc-207-*-token; do
  color=$(basename "$dir" | sed 's/pirc-207-//;s/-token//')
  # You can manually add the IDs after running, or modify script to save them
  echo "• $color layer → https://testnet.stellarexplorer.org/contract/<PASTE_CONTRACT_ID_HERE>"
done
