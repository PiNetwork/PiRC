#!/bin/bash
echo "🚀 Running contract: PiRC253GrantDistribution"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "PiRC253GrantDistribution" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_PiRC253GrantDistribution.js --network testnet"
fi
echo "✅ Example ready."
