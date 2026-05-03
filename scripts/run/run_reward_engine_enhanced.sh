#!/bin/bash
echo "🚀 Running contract: reward_engine_enhanced"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "reward_engine_enhanced" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_reward_engine_enhanced.js --network testnet"
fi
echo "✅ Example ready."
