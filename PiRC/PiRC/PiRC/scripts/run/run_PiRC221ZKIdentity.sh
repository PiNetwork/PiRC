#!/bin/bash
echo "🚀 Running contract: PiRC221ZKIdentity"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "PiRC221ZKIdentity" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_PiRC221ZKIdentity.js --network testnet"
fi
echo "✅ Example ready."
