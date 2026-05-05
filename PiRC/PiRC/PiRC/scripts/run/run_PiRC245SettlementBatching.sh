#!/bin/bash
echo "🚀 Running contract: PiRC245SettlementBatching"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "PiRC245SettlementBatching" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_PiRC245SettlementBatching.js --network testnet"
fi
echo "✅ Example ready."
