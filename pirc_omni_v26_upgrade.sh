#!/bin/bash
# ==============================================================================
# PiRC Protocol Upgrade Automation Script
# Target: Protocol v23 (Mainnet) & v26 (Testnet)
# ==============================================================================
set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Initializing PiRC Protocol Upgrade to v26 (Testnet) / v23 (Mainnet)..."

file_exists_in_any_branch() {
    local target_file=$1
    if [ ! -d ".git" ]; then
        if [ -f "$target_file" ]; then return 0; else return 1; fi
    fi
    local found=false
    for branch in $(git branch -a --format='%(refname:short)'); do
        if git ls-tree -r "$branch" --name-only 2>/dev/null | grep -q "^${target_file}$"; then
            found=true; break
        fi
    done
    if [ "$found" = "true" ]; then return 0; else return 1; fi
}

generate_unique_file() {
    local file_path=$1
    local content=$2
    if file_exists_in_any_branch "$file_path"; then
        log_warn "File '$file_path' already exists in the repository across branches. Skipping generation."
    else
        log_info "Generating unique file: $file_path"
        mkdir -p "$(dirname "$file_path")"
        echo -e "$content" > "$file_path"
        log_success "Created $file_path"
    fi
}

log_info "Scanning for Cargo.toml files to upgrade to Soroban SDK v26.0.0..."
find . -type f -name "Cargo.toml" -not -path "*/node_modules/*" -not -path "*/target/*" | while read -r cargo_file; do
    sed -i 's/soroban-sdk\s*=\s*"[^"]*"/soroban-sdk = "26.0.0"/g' "$cargo_file"
    sed -i 's/soroban-sdk-macros\s*=\s*"[^"]*"/soroban-sdk-macros = "26.0.0"/g' "$cargo_file"
done

log_info "Upgrading GitHub Actions workflows..."
if [ -d ".github/workflows" ]; then
    find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \) | while read -r workflow_file; do
        sed -i 's/soroban-cli:\s*[0-9\.]*/soroban-cli: 26.0.0/g' "$workflow_file"
    done
fi

log_info "Updating RPC endpoints in frontend configurations..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -not -path "*/node_modules/*" | while read -r script_file; do
    if grep -q "minepi.com" "$script_file"; then
        sed -i 's|https://[^"]*\.minepi\.com|https://rpc.testnet.minepi.com|g' "$script_file"
    fi
done

MIGRATION_GUIDE="docs/MIGRATION_V26.md"
MIGRATION_CONTENT="# Soroban V26 Migration Guide\n\nThis document tracks breaking changes from v22 to v26.\n\n- Updated \`soroban-sdk\` to \`26.0.0\`\n- Contracts built for \`wasm32-unknown-unknown\`\n- Deployment targets Testnet v26."
generate_unique_file "$MIGRATION_GUIDE" "$MIGRATION_CONTENT"

log_success "PiRC Upgrade & Standardization Pipeline Completed."
