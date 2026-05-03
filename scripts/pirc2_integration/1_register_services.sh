#!/bin/bash
# Description: Registers the 7 PiDEX Layers as paid services on the PiRC2 Contract.
# Run this as the Merchant (Ze0ro99)

PIRC2_CONTRACT="CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV"
MERCHANT_ADDR="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
NETWORK="testnet"

echo "Registering PiDEX L1 (Gold Tier) as a PiRC2 Service..."
soroban contract invoke \
  --id $PIRC2_CONTRACT \
  --network $NETWORK \
  --source-account $STELLAR_TESTNET_SECRET \
  -- register_service \
  --merchant $MERCHANT_ADDR \
  --name "PiDEX L1 Gold Access" \
  --price 10000000 \
  --period_secs 2592000 \
  --trial_period_secs 604800 \
  --approve_periods 12
  
echo "Service Registered! Pioneers can now subscribe to L1 Gold."
