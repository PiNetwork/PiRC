#!/bin/bash
echo "🚀 Running contract: PiRC241ZKCorporateID"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "PiRC241ZKCorporateID" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_PiRC241ZKCorporateID.js --network testnet"
fi
echo "✅ Example ready."
