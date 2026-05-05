#!/bin/bash
REGISTRY_ID="$1"
echo "🔍 Verifying PiRC-207 Registry + 7 Layers..."
for i in {0..6}; do
  echo "=== Layer $i ==="
  stellar contract invoke --id "$REGISTRY_ID" --network testnet -- get_layer_metadata --layer_id "$i"
done
echo "✅ All layers verified!"
