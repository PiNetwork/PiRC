#!/bin/bash
echo "🚀 Running contract: nft_utility_contract"
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "nft_utility_contract" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_nft_utility_contract.js --network testnet"
fi
echo "✅ Example ready."
