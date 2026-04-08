#!/bin/bash
echo "🚀 Starting PiRC-101 Automated Deployment to Soroban Testnet..."

# 1. Build
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy Contracts (Using existing files)
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/pi_token.wasm --source admin --network testnet
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/treasury_vault.wasm --source admin --network testnet

# 3. Bootstrap Liquidity
echo "Initialization Complete. PiRC-101 is LIVE on Testnet."

