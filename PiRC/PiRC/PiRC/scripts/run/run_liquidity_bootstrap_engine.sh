#!/bin/bash
echo "🚀 Running contract: liquidity_bootstrap_engine"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "liquidity_bootstrap_engine" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_liquidity_bootstrap_engine.js --network testnet"
fi
echo "✅ Example ready."
