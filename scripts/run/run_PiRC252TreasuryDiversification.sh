#!/bin/bash
echo "🚀 Running contract: PiRC252TreasuryDiversification"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "PiRC252TreasuryDiversification" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_PiRC252TreasuryDiversification.js --network testnet"
fi
echo "✅ Example ready."
