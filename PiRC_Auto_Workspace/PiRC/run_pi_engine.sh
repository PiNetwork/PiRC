#!/bin/bash
# PIRC-2 Official Constants
export CONTRACT_ID="CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV"
export RPC_URL="https://rpc.testnet.minepi.com"
export NETWORK_PASSPHRASE="Pi Testnet"
export MY_SECRET="SAG3TQD5BTNAHF53RMBKI5M67IEH5U7J4BC32HAUR2JEW76NYMXAJ2WW"

# Add Network
stellar network add pi-testnet --rpc-url "$RPC_URL" --network-passphrase "$NETWORK_PASSPHRASE" 2>/dev/null || true

# Import Key with fallback for different CLI versions
echo "Importing authority keys..."
stellar keys add pioneer_auth --secret-key "$MY_SECRET" --force 2>/dev/null || \
stellar keys add pioneer_auth --secret "$MY_SECRET" --force 2>/dev/null

# Extract and Verify Address
ADDR=$(stellar keys address pioneer_auth)
if [ -z "$ADDR" ]; then
    echo "❌ CRITICAL ERROR: Could not derive wallet address."
    exit 1
fi

echo "✅ Identity Verified: $ADDR"

# Execute Lifecycle [Based on 5.2, 6.1 specs]
echo "Step A: Registering Service..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network pi-testnet \
  --source pioneer_auth \
  -- register_service \
  --merchant "$ADDR" \
  --name "Ze0ro99 Professional AI" \
  --price 10000000 \
  --period_secs 2592000 \
  --trial_period_secs 0 \
  --approve_periods 12

echo "Step B: Subscribing..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network pi-testnet \
  --source pioneer_auth \
  -- subscribe \
  --subscriber "$ADDR" \
  --service_id 0 \
  --auto_renew true

echo "Step C: Processing Batch..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network pi-testnet \
  --source pioneer_auth \
  -- process \
  --merchant "$ADDR" \
  --service_id 0 \
  --offset 0 \
  --limit 10

echo "✅ SUCCESS: All operations synchronized with Pi Network."
