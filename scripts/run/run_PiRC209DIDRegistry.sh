#!/bin/bash
echo "🚀 Running contract: PiRC209DIDRegistry"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "PiRC209DIDRegistry" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_PiRC209DIDRegistry.js --network testnet"
fi
echo "✅ Example ready."
