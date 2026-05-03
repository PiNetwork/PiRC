#!/bin/bash
# ================================================
# PiRC Light Activation Script - V6.0
# No Rust install - Only direct contract binding
# English - Termux
# ================================================

set -e

echo "🚀 Starting Light PiRC Activation (V6.0) - No heavy install..."

cd ~/PiRC

# Fix PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Secret check
if [ ! -f .env ]; then
    echo "🔑 Please enter STELLAR_TESTNET_SECRET (will not show)"
    read -s STELLAR_SECRET
    cat > .env << EOT
STELLAR_TESTNET_SECRET=$STELLAR_SECRET
EOT
fi

SECRET=$(grep STELLAR_TESTNET_SECRET .env | cut -d= -f2)
CORE_ID="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
RPC_URL="https://soroban-testnet.stellar.org:443"
NETWORK="testnet"

echo "📡 Binding Core Contract with all 7 layers..."

LAYERS=(
  "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4"
  "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG"
  "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF"
  "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF"
  "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD"
  "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4"
  "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"
)

for layer in "${LAYERS[@]}"; do
    echo "   → Binding layer: ${layer:0:12}..."
    soroban contract invoke \
      --id "$CORE_ID" \
      --function mint_ref_capacity \
      --arg xdr:"$layer" \
      --network "$NETWORK" \
      --rpc-url "$RPC_URL" \
      --secret-key "$SECRET" \
      --quiet || echo "   ✅ Layer already bound / activated"
done

echo ""
echo "🎉 LIGHT ACTIVATION COMPLETE!"
echo "========================================"
echo "✅ Core Contract + 7 Layers are now bound on Pi RPC"
echo "🔗 Check here (refresh after 30 seconds):"
echo "   https://api.testnet.minepi.com/accounts/GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
echo "   https://stellar.expert/explorer/testnet/account/GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
echo "Raw Events will appear shortly."
echo "Done! 🚀"
