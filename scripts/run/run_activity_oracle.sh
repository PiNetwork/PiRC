#!/bin/bash
echo "🚀 Running contract: activity_oracle"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "activity_oracle" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_activity_oracle.js --network testnet"
fi
echo "✅ Example ready."
