#!/bin/bash
# Description: Batch charges all active PiDEX subscribers (Run monthly/daily)

PIRC2_CONTRACT="CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV"
MERCHANT_ADDR="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"

echo "Executing PiRC2 Process() - Batch Charging Due Subscriptions..."
soroban contract invoke \
  --id $PIRC2_CONTRACT \
  --network testnet \
  --source-account $STELLAR_TESTNET_SECRET \
  -- process \
  --merchant $MERCHANT_ADDR \
  --service_id 0 \
  --offset 0 \
  --limit 50
