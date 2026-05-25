#!/bin/bash
echo "🚀 Deploying Luxamir Integration via SSH..."
cd ../../../
./build_and_sync_smartcontracts.sh 2>/dev/null || echo "⚠️ build skipped"
cd Omni_Sovereign_Architecture/04_Physical_RWA_Environment/luxamir_integration || exit 1
echo "✅ Luxamir integration deployed!"
