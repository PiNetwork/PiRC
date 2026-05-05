#!/bin/bash
# ===============================================
#   🟢 PiRC Soroban CLI Master Operations 🟢   
# ===============================================
source ../.env 2>/dev/null || true

echo "1) Mint Asset (Requires Contract ID & Signer)"
echo "2) Check Token Balance"
echo "3) Invoke Differential Geometry Matrix (Ping)"
echo "4) Exit"
echo "==============================================="
read -p "Select operation (1-4): " OP

case $OP in
  1)
    read -p "Enter Contract ID: " CONTRACT_ID; read -p "Enter Recipient Address: " RECIPIENT; read -p "Enter Amount: " AMOUNT
    soroban contract invoke --id "$CONTRACT_ID" --network testnet --source default -- mint --to "$RECIPIENT" --amount "$AMOUNT"
    ;;
  2)
    read -p "Enter Contract ID: " CONTRACT_ID; read -p "Enter Address to check: " TARGET
    soroban contract invoke --id "$CONTRACT_ID" --network testnet --source default -- balance --id "$TARGET"
    ;;
  3)
    read -p "Enter Main Sovereign Factory ID: " FACTORY_ID
    soroban contract invoke --id "$FACTORY_ID" --network testnet --source default -- ping 
    ;;
  *)
    echo "Exiting."
    exit 0
    ;;
esac
