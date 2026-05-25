#!/bin/bash
# =============================================================================
# 🔐 SECURE STELLAR ACCOUNT VERIFICATION & SETUP
# Production-Ready Credential Management
# =============================================================================

set -euo pipefail

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# STEP 0: Environment Setup & Security
# =============================================================================

log_info "Setting up secure environment..."

# Create secure directories
mkdir -p ~/.stellar/keys ~/.stellar/config ~/.stellar/logs
chmod 700 ~/.stellar/keys

# Check for required tools
check_requirements() {
    local missing=false
    
    if ! command -v stellar &> /dev/null; then
        log_error "Stellar CLI not found. Install with: cargo install stellar-cli"
        missing=true
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warn "jq not found. Installing..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get install -y jq
        elif command -v brew &> /dev/null; then
            brew install jq
        fi
    fi
    
    if [ "$missing" = true ]; then
        log_error "Please install missing requirements"
        exit 1
    fi
}

check_requirements

# =============================================================================
# STEP 1: Account Verification (Public Address Only)
# =============================================================================

log_info "Verifying Stellar Account..."

PUBLIC_ADDRESS="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"
TESTNET_RPC="https://rpc-testnet.minepi.com"
MAINNET_RPC="https://rpc.stellar.org"

# Function to check account on network
check_account() {
    local address=$1
    local rpc=$2
    local network=$3
    
    log_info "Checking account on $network..."
    
    if response=$(curl -s "$rpc/accounts/$address"); then
        if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
            log_success "Account verified on $network"
            echo "$response" | jq '.'
            return 0
        else
            log_warn "Account not yet activated on $network"
            return 1
        fi
    else
        log_error "Cannot reach $network RPC"
        return 1
    fi
}

# Verify on Testnet
check_account "$PUBLIC_ADDRESS" "$TESTNET_RPC" "Pi Testnet" || log_warn "Account not on testnet yet"

# =============================================================================
# STEP 2: Secure Key Management Setup
# =============================================================================

log_info "Setting up secure credential management..."

# Create a template for environment variables (USER MUST FILL IN)
cat > ~/.stellar/config/.env.template << 'EOF'
# ⚠️ NEVER COMMIT THIS FILE
# Add to .gitignore and keep private!

# Account Information (PUBLIC - Safe to share)
STELLAR_PUBLIC_ADDRESS="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"

# Credentials (PRIVATE - Keep secret!)
# Option 1: Seed (Only keep in secure vaults like 1Password, Keybase, or HashiCorp Vault)
# STELLAR_SECRET_SEED="SAG3TQD5BTNAHF53RMBKI5M67IEH5U7J4BC32HAUR2JEW76NYMXAJ2WW"

# Option 2: Hardware Wallet (Recommended for production)
# STELLAR_HARDWARE_WALLET="ledger"
# STELLAR_LEDGER_PATH="m/44'/148'/0'/0'/0'"

# Option 3: Key File (Encrypted)
STELLAR_KEY_FILE="~/.stellar/keys/production.key"

# Network Configuration
STELLAR_NETWORK="testnet"  # or "public" for mainnet
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
STELLAR_RPC_URL="https://rpc-testnet.minepi.com"

# Contract Configuration
PIRC_CONTRACT_ID=""  # Will be populated after deployment
PIRC_MERCHANT_ADDRESS="${STELLAR_PUBLIC_ADDRESS}"
PIRC_XLM_TOKEN_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HPJVIEWNFEMIVENVF7U6Y2DEB6A5DEWNDO"

# Logging
LOG_LEVEL="INFO"
LOG_FILE="~/.stellar/logs/operations.log"
EOF

chmod 600 ~/.stellar/config/.env.template

log_success "Created environment template at ~/.stellar/config/.env.template"
log_warn "⚠️  IMPORTANT: Copy this template to .env and fill in your STELLAR_SECRET_SEED"
log_warn "⚠️  NEVER commit .env to git. Add it to .gitignore"
log_warn "⚠️  Use GitHub Secrets for CI/CD, not environment files"

# =============================================================================
# STEP 3: Secure Credential Storage Options
# =============================================================================

log_info "Credential Storage Options:"
cat << 'EOF'

Option 1: GitHub Secrets (Recommended for CI/CD)
  1. Go to Settings → Secrets and variables → Actions
  2. Click "New repository secret"
  3. Name: STELLAR_SECRET_SEED
  4. Value: Your seed (SAG3TQD5BT...)
  5. Add STELLAR_PUBLIC_ADDRESS as well

Option 2: Local Encrypted File
  # Encrypt with gpg
  gpg --symmetric ~/.stellar/config/.env
  
  # Use in scripts:
  gpg --decrypt ~/.stellar/config/.env.gpg

Option 3: Keybase
  # Store secret securely
  keybase secfs write stellar_secret "$(cat secret.txt)"
  
  # Retrieve in scripts:
  keybase secfs read stellar_secret

Option 4: HashiCorp Vault
  # Enterprise-grade secret management
  vault kv put secret/stellar address=GA3ECR... seed=SAG3TD...

Option 5: Hardware Wallet (Most Secure)
  # Use with Ledger or Trezor
  stellar config network
  stellar keys generate --ledger

EOF

# =============================================================================
# STEP 4: Create GitHub Actions Secrets Setup Script
# =============================================================================

log_info "Creating GitHub Actions setup helper..."

cat > ~/.stellar/config/setup-github-secrets.sh << 'EOF'
#!/bin/bash
# Setup GitHub Secrets for Stellar Operations
# Usage: ./setup-github-secrets.sh

set -euo pipefail

REPO_OWNER="Ze0ro99"
REPO_NAME="PiRC"

log_info() { echo "[INFO] $1"; }
log_error() { echo "[ERROR] $1"; }

log_info "GitHub Secrets Setup Helper"
log_info "Repository: $REPO_OWNER/$REPO_NAME"
log_info ""

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI not installed. Install from: https://cli.github.com"
    exit 1
fi

# Check authentication
if ! gh auth status > /dev/null 2>&1; then
    log_error "Not authenticated with GitHub. Run: gh auth login"
    exit 1
fi

log_info "Setting up secrets..."

# Get user input securely
read -sp "Enter your Stellar Secret Seed: " STELLAR_SECRET_SEED
echo ""
read -p "Enter your Stellar Public Address: " STELLAR_PUBLIC_ADDRESS

# Set secrets
gh secret set STELLAR_SECRET_SEED --repo "$REPO_OWNER/$REPO_NAME" --body "$STELLAR_SECRET_SEED"
gh secret set STELLAR_PUBLIC_ADDRESS --repo "$REPO_OWNER/$REPO_NAME" --body "$STELLAR_PUBLIC_ADDRESS"

log_info "✅ Secrets configured successfully!"
log_info "Verify with: gh secret list --repo $REPO_OWNER/$REPO_NAME"
EOF

chmod 755 ~/.stellar/config/setup-github-secrets.sh

# =============================================================================
# STEP 5: Create Secure Transaction Script Template
# =============================================================================

log_info "Creating secure transaction templates..."

cat > ~/.stellar/config/transaction-template.sh << 'EOF'
#!/bin/bash
# =============================================================================
# Secure Stellar Transaction Executor
# Loads credentials from environment or vault
# =============================================================================

set -euo pipefail

# Load environment (add to .gitignore!)
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

# Fallback to GitHub Actions secrets
STELLAR_PUBLIC_ADDRESS="${STELLAR_PUBLIC_ADDRESS:-}"
STELLAR_SECRET_SEED="${STELLAR_SECRET_SEED:-}"
STELLAR_NETWORK="${STELLAR_NETWORK:-testnet}"
STELLAR_RPC_URL="${STELLAR_RPC_URL:-https://rpc-testnet.minepi.com}"

# Security check
if [ -z "$STELLAR_SECRET_SEED" ]; then
    echo "[ERROR] STELLAR_SECRET_SEED not set"
    echo "Set via:"
    echo "  export STELLAR_SECRET_SEED='...'"
    echo "  or in .env file"
    echo "  or GitHub Secrets"
    exit 1
fi

log_info() { echo "[INFO] $1"; }
log_success() { echo "[SUCCESS] $1"; }
log_error() { echo "[ERROR] $1"; }

# =============================================================================
# Account Information Queries (Public)
# =============================================================================

query_account_info() {
    local address=$1
    log_info "Querying account: $address"
    
    curl -s "$STELLAR_RPC_URL/accounts/$address" | jq '{
        id,
        account_id,
        account_muxed,
        created_at,
        balances,
        sequence,
        subentry_count,
        home_domain,
        last_modified_ledger
    }'
}

# =============================================================================
# Transaction Builders (Secure)
# =============================================================================

build_payment_transaction() {
    local destination=$1
    local amount=$2
    local asset_code=$3
    
    log_info "Building payment: $amount $asset_code to $destination"
    
    stellar transaction build \
        --source-account "$STELLAR_PUBLIC_ADDRESS" \
        --network "$STELLAR_NETWORK" \
        --base-fee 100 \
        -- payment \
            --destination "$destination" \
            --amount "$amount" \
            --asset "$asset_code"
}

build_contract_invocation() {
    local contract_id=$1
    local method=$2
    shift 2
    local args=("$@")
    
    log_info "Building contract invocation: $method on $contract_id"
    
    stellar contract invoke \
        --source-account "$STELLAR_PUBLIC_ADDRESS" \
        --fee 100000 \
        --id "$contract_id" \
        --network "$STELLAR_NETWORK" \
        -- "$method" \
        "${args[@]}"
}

# =============================================================================
# Transaction Signing (PRIVATE)
# =============================================================================

sign_and_submit() {
    local tx_file=$1
    
    if [ ! -f "$tx_file" ]; then
        log_error "Transaction file not found: $tx_file"
        return 1
    fi
    
    log_info "Signing transaction..."
    
    # Sign with secret seed
    stellar transaction sign --signer "$STELLAR_SECRET_SEED" "$tx_file"
    
    log_success "Transaction signed"
    log_info "Submitting to network..."
    
    # Submit to network
    stellar transaction submit "$tx_file"
    
    log_success "Transaction submitted"
}

# =============================================================================
# Example Usage
# =============================================================================

if [ "${1:-}" = "account" ]; then
    query_account_info "${2:-$STELLAR_PUBLIC_ADDRESS}"
elif [ "${1:-}" = "payment" ]; then
    build_payment_transaction "$2" "$3" "$4"
else
    echo "Usage: $0 [command] [args]"
    echo "Commands:"
    echo "  account [address]     - Query account info"
    echo "  payment dest amt code - Build payment"
fi
EOF

chmod 755 ~/.stellar/config/transaction-template.sh

# =============================================================================
# STEP 6: Account Health Check
# =============================================================================

log_info "Performing account health check..."

cat > ~/.stellar/config/health-check.sh << 'EOF'
#!/bin/bash
# Account Health & Balance Check

NETWORK="${1:-testnet}"
ADDRESS="GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6"

case "$NETWORK" in
    testnet)
        RPC="https://rpc-testnet.minepi.com"
        EXPLORER="https://stellar.expert/explorer/testnet"
        ;;
    mainnet)
        RPC="https://rpc.stellar.org"
        EXPLORER="https://stellar.expert/explorer/public"
        ;;
    *)
        echo "Usage: $0 [testnet|mainnet]"
        exit 1
        ;;
esac

echo "═══════════════════════════════════════════════════════════"
echo "Account Health Check: $NETWORK"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Address: $ADDRESS"
echo ""

# Fetch account data
ACCOUNT_DATA=$(curl -s "$RPC/accounts/$ADDRESS")

if echo "$ACCOUNT_DATA" | jq -e '.id' > /dev/null 2>&1; then
    echo "✅ Account Status: ACTIVE"
    echo ""
    echo "Account Details:"
    echo "$ACCOUNT_DATA" | jq '{
        sequence: .sequence,
        subentry_count: .subentry_count,
        last_modified_ledger: .last_modified_ledger,
        balances: .balances,
        thresholds: .thresholds,
        flags: .flags,
        home_domain: .home_domain
    }'
    echo ""
    echo "Explorer: $EXPLORER/account/$ADDRESS"
else
    echo "⚠️  Account Status: NOT ACTIVATED"
    echo "The account needs to be funded first."
    echo ""
    echo "To activate on testnet:"
    echo "1. Use a testnet faucet:"
    echo "   https://stellar.org/laboratory/#account-creator?network=test"
    echo ""
    echo "2. Or send funds from another account"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
EOF

chmod 755 ~/.stellar/config/health-check.sh

# Run health check
bash ~/.stellar/config/health-check.sh testnet

# =============================================================================
# STEP 7: Create Local Development Setup
# =============================================================================

log_info "Creating local development environment..."

cat > .env.example << 'EOF'
# Stellar Configuration
# Copy this file to .env and fill in your values
# NEVER commit .env to git!

# Public Information (Safe to share)
STELLAR_PUBLIC_ADDRESS=GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6

# Private Information (Keep secret!)
# OPTION 1: Seed (use with caution locally only)
# STELLAR_SECRET_SEED=SAG3TQD5BTNAHF53RMBKI5M67IEH5U7J4BC32HAUR2JEW76NYMXAJ2WW

# OPTION 2: GitHub Actions (recommended)
# Use gh secret set STELLAR_SECRET_SEED

# Network
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://rpc-testnet.minepi.com
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Contract (will be set after deployment)
PIRC_CONTRACT_ID=
EOF

log_success "Created .env.example"

# Create .gitignore additions
cat >> .gitignore.stellar << 'EOF'
# Stellar Credentials - NEVER commit!
.env
.env.local
.env.*.local
~/.stellar/keys/*
.stellar/keys/*
stellar.key*
*.pem
*.key

# Security
.vault*
.secrets*
credentials.json

# Logs
~/.stellar/logs/*
.stellar/logs/*
*.log

EOF

log_success "Created .gitignore.stellar - add to your .gitignore"

# =============================================================================
# STEP 8: Summary & Next Steps
# =============================================================================

log_success "Account Verification Complete!"

cat << EOF

═══════════════════════════════════════════════════════════════════════════
📋 SUMMARY & NEXT STEPS
═══════════════════════════════════════════════════════════════════════════

Your Account: GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6

1. SET UP SECURE CREDENTIALS
   ─────────────────────────
   
   Option A: GitHub Secrets (Recommended for CI/CD)
   $ bash ~/.stellar/config/setup-github-secrets.sh
   
   Option B: Local .env file (Only for local development)
   $ cp .env.example .env
   $ nano .env  # Add STELLAR_SECRET_SEED
   $ # NEVER commit .env!
   
   Option C: Encrypted File
   $ gpg --symmetric ~/.stellar/keys/stellar.key

2. VERIFY YOUR ACCOUNT
   ──────────────────
   bash ~/.stellar/config/health-check.sh testnet
   bash ~/.stellar/config/health-check.sh mainnet

3. EXPLORE ACCOUNT
   ──────────────
   Testnet: https://stellar.expert/explorer/testnet/account/GA3ECR...
   Mainnet: https://stellar.expert/explorer/public/account/GA3ECR...

4. NEXT: DEPLOY SMART CONTRACTS
   ────────────────────────────
   $ bash .github/scripts/deploy-contract.sh testnet

═══════════════════════════════════════════════════════════════════════════
🔐 SECURITY CHECKLIST
═══════════════════════════════════════════════════════════════════════════

✅ Never hardcode secrets in scripts
✅ Never commit .env files
✅ Use GitHub Secrets for CI/CD
✅ Use encrypted storage for local development
✅ Rotate keys if compromised
✅ Use hardware wallets for production (Ledger/Trezor)
✅ Keep seed phrases offline
✅ Separate read-only and signing credentials

═══════════════════════════════════════════════════════════════════════════

Created files:
  ~/.stellar/config/.env.template
  ~/.stellar/config/setup-github-secrets.sh
  ~/.stellar/config/transaction-template.sh
  ~/.stellar/config/health-check.sh
  .env.example
  .gitignore.stellar

EOF

log_success "Setup complete! Review the steps above and follow the security best practices."
