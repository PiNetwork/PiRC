#!/bin/bash
# ==============================================================================
# πRC Sovereign OS - Universal Contract Sync
# Description: Automatically updates Master Contract IDs across all files.
# ==============================================================================

MASTER_CONTRACT="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"

echo "[INFO] Starting Universal Sync for Sovereign OS..."
echo "[INFO] Target Master Contract: $MASTER_CONTRACT"

# Find all relevant code files (JS, TS, HTML), excluding node_modules and .git
for file in $(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.html" \) -not -path "*/node_modules/*" -not -path "*/\.git/*" 2>/dev/null); do
  if grep -q "MASTER_CONTRACT_ID" "$file"; then
    # Replace standard variable assignments safely
    sed -i "s/const MASTER_CONTRACT_ID = .*/const MASTER_CONTRACT_ID = \"$MASTER_CONTRACT\";/g" "$file" || true
    sed -i "s/export const MASTER_CONTRACT_ID = .*/export const MASTER_CONTRACT_ID = \"$MASTER_CONTRACT\";/g" "$file" || true
    echo "  -> [UPDATED CONTRACT ID] in $file"
  fi
done

echo "[INFO] Universal Sync Complete! Changes are ready to be committed."
