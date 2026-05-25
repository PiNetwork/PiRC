#!/bin/bash
# ==============================================================================
# PiRC Automated SSH Sync
# Pushes updates to GitHub via SSH without requiring a password prompt.
# ==============================================================================
set -euo pipefail

# --- Matrix Color Layers ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_succ() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_err()  { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Verifying SSH agent and keys..."

# Start ssh-agent if not already running
if ! pgrep -u "$USER" ssh-agent > /dev/null; then
    eval "$(ssh-agent -s)" > /dev/null
fi

# Ensure ed25519 key is added
if ! ssh-add -l | grep -q -i "ed25519" && [ -f ~/.ssh/id_ed25519 ]; then
    log_info "Adding SSH key to agent..."
    ssh-add ~/.ssh/id_ed25519 >/dev/null 2>&1 || true
fi

# Set the remote URL explicitly to SSH to avoid HTTPS token prompts
git remote set-url origin git@github.com:Ze0ro99/PiRC.git

# Configure Git to use SSH in BatchMode (fails fast instead of asking for passwords)
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o BatchMode=yes"

log_info "Pulling latest changes via SSH..."
git pull --rebase origin "$(git branch --show-current)" 2>/dev/null || true

log_info "Pushing updates to origin via SSH..."
if git push origin "$(git branch --show-current)"; then
    log_succ "Successfully pushed to GitHub via SSH!"
else
    log_err "Push failed. Ensure your SSH key is valid and has write access."
    exit 1
fi
