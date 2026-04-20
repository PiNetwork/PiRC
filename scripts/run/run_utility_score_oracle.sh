#!/bin/bash
echo "🚀 Running contract: utility_score_oracle"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "utility_score_oracle" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_utility_score_oracle.js --network testnet"
fi
echo "✅ Example ready."
