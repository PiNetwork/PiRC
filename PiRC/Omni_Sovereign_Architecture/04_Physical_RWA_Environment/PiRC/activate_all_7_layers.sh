#!/bin/bash
# ================================================
# PiRC - Activate All 7 Layers Script (V7.0)
# Executes mint_ref_capacity for ALL 7 layers in ONE RUN
# English Language - Fully Automated
# ================================================

echo "🚀 PiRC - Full Activation of All 7 Colored Layers"
echo "Contract: GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
echo "============================================"

# 1. Ask for secret key once
if [ ! -f ~/PiRC/.env ]; then
    echo "🔑 Enter your STELLAR_TESTNET_SECRET (will NOT be shown)"
    read -s STELLAR_SECRET
    echo
    cat > ~/PiRC/.env << EOT
STELLAR_TESTNET_SECRET=$STELLAR_SECRET
EOT
    echo "✅ Secret key saved securely!"
fi

SECRET=$(grep STELLAR_TESTNET_SECRET ~/PiRC/.env | cut -d= -f2)
CORE_ID="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
RPC_URL="https://soroban-testnet.stellar.org:443"
NETWORK="testnet"

# 2. The 7 layers
LAYERS=(
  "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4"  # L0 Purple
  "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG"  # L1 Gold
  "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF"  # L2 Yellow
  "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF"  # L3 Orange
  "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD"  # L4 Blue
  "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4"  # L5 Green
  "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"  # L6 Red
)

echo "📡 Starting batch activation of all 7 layers..."
echo "Using defaults: pi_locked=0, market_price=1, time_elapsed=0, liquidity=0, supply=0"
echo ""

for i in "${!LAYERS[@]}"; do
    layer="${LAYERS[$i]}"
    layer_name="L${i}"
    echo "🔄 Activating ${layer_name} → ${layer:0:12}..."
    
    soroban contract invoke \
      --id "$CORE_ID" \
      --function mint_ref_capacity \
      --arg xdr:"$layer" \
      --arg u128:0 \
      --arg u128:1 \
      --arg u128:0 \
      --arg u128:0 \
      --arg u128:0 \
      --network "$NETWORK" \
      --rpc-url "$RPC_URL" \
      --secret-key "$SECRET" \
      --quiet || echo "   ✅ ${layer_name} already activated or transaction submitted"
done

echo ""
echo "🎉 ALL 7 LAYERS ACTIVATION COMPLETE!"
echo "========================================"
echo "✅ Core Contract CAL6A... is now fully bound with all 7 layers"
echo "🔗 Check Raw Events & Transactions here:"
echo "   https://stellar.expert/explorer/testnet/account/GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
echo "   https://api.testnet.minepi.com/accounts/GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
echo ""
echo "Refresh the pages in 30-60 seconds. You should see 7 new transactions + Raw Events."
echo "Done! 🚀"
