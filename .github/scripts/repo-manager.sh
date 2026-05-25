#!/bin/bash

################################################################################
# Repository Manager Script for Ze0ro99/PiRC
# Purpose: Automate file management, updates, formatting, repairs, and more
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Display usage information
usage() {
    cat << EOF
Repository Manager - Ze0ro99/PiRC

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  format              Format all code files
  lint                Run linters on code
  security            Check for security vulnerabilities
  update-deps         Update dependencies
  repair              Auto-repair common issues
  branch BRANCH       Switch to and work with specific branch
  sync                Sync with remote repository
  status              Show repository status
  clean               Clean temporary files and caches
  all                 Run format, lint, security, and repair
  help                Display this help message

Options:
  -v, --verbose       Verbose output
  -d, --dry-run       Show what would be done without making changes

Examples:
  $0 format
  $0 security --verbose
  $0 branch main
  $0 all --dry-run

EOF
}

# Parse command line arguments
COMMAND="${1:-help}"
DRY_RUN=false
VERBOSE=false

shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose) VERBOSE=true; shift ;;
        -d|--dry-run) DRY_RUN=true; shift ;;
        *) break ;;
    esac
done

# Execute with dry-run prefix if needed
EXEC_PREFIX=""
if [[ "$DRY_RUN" == true ]]; then
    EXEC_PREFIX="echo [DRY-RUN] "
fi

# Format code files
format_code() {
    log_info "Starting code formatting..."
    
    # Format Python files
    if command -v black &> /dev/null; then
        log_info "Formatting Python files with Black..."
        $EXEC_PREFIX black --line-length 100 . --exclude venv,__pycache__ || log_warn "Black formatting had issues"
    fi
    
    # Format shell scripts
    if command -v shfmt &> /dev/null; then
        log_info "Formatting shell scripts..."
        $EXEC_PREFIX find . -type f -name "*.sh" -not -path "./node_modules/*" -exec shfmt -i 4 -w {} \; || log_warn "shfmt had issues"
    fi
    
    # Format JavaScript/TypeScript
    if command -v prettier &> /dev/null; then
        log_info "Formatting JavaScript/HTML files with Prettier..."
        $EXEC_PREFIX prettier --write . --ignore-path .gitignore || log_warn "Prettier had issues"
    fi
    
    # Format Rust files
    if command -v rustfmt &> /dev/null; then
        log_info "Formatting Rust files..."
        $EXEC_PREFIX rustfmt --edition 2021 $(find . -type f -name "*.rs" -not -path "./target/*") || log_warn "rustfmt had issues"
    fi
    
    log_success "Code formatting complete"
}

# Run linters
lint_code() {
    log_info "Starting code linting..."
    
    # Python linting
    if command -v pylint &> /dev/null; then
        log_info "Linting Python files with pylint..."
        $EXEC_PREFIX pylint $(find . -type f -name "*.py" -not -path "./venv/*") || log_warn "pylint found issues"
    fi
    
    if command -v flake8 &> /dev/null; then
        log_info "Linting Python files with flake8..."
        $EXEC_PREFIX flake8 . --exclude venv,__pycache__ || log_warn "flake8 found issues"
    fi
    
    # Shell linting
    if command -v shellcheck &> /dev/null; then
        log_info "Linting shell scripts..."
        $EXEC_PREFIX shellcheck $(find . -type f -name "*.sh") || log_warn "shellcheck found issues"
    fi
    
    # JavaScript/TypeScript linting
    if command -v eslint &> /dev/null; then
        log_info "Linting JavaScript/TypeScript files..."
        $EXEC_PREFIX eslint . || log_warn "eslint found issues"
    fi
    
    # Rust linting
    if command -v clippy-driver &> /dev/null; then
        log_info "Linting Rust files with Clippy..."
        cd "$(find . -name 'Cargo.toml' -type f | head -1 | xargs dirname)" 2>/dev/null || true
        $EXEC_PREFIX cargo clippy --all-targets --all-features || log_warn "Clippy found issues"
        cd - > /dev/null
    fi
    
    log_success "Code linting complete"
}

# Security vulnerability checks
check_security() {
    log_info "Starting security vulnerability checks..."
    
    # Check Python dependencies
    if command -v safety &> /dev/null; then
        log_info "Checking Python dependencies with Safety..."
        $EXEC_PREFIX safety check --json || log_warn "Safety found vulnerabilities"
    fi
    
    # Check Node dependencies
    if command -v npm &> /dev/null && [[ -f "package.json" ]]; then
        log_info "Checking Node dependencies..."
        $EXEC_PREFIX npm audit || log_warn "npm audit found vulnerabilities"
    fi
    
    # Check Rust dependencies
    if command -v cargo &> /dev/null && [[ -f "Cargo.toml" ]]; then
        log_info "Checking Rust dependencies..."
        $EXEC_PREFIX cargo audit || log_warn "cargo audit found vulnerabilities"
    fi
    
    # Solidity security check
    if command -v slither &> /dev/null; then
        log_info "Checking Solidity smart contracts with Slither..."
        $EXEC_PREFIX find . -name "*.sol" -type f -exec slither {} \; || log_warn "Slither found issues"
    fi
    
    # Secret scanning
    if command -v truffleHog &> /dev/null; then
        log_info "Scanning for secrets..."
        $EXEC_PREFIX truffleHog filesystem . --json || log_warn "Secret scan completed"
    fi
    
    log_success "Security checks complete"
}

# Update dependencies
update_dependencies() {
    log_info "Starting dependency updates..."
    
    # Update Python dependencies
    if [[ -f "requirements.txt" ]]; then
        log_info "Updating Python dependencies..."
        $EXEC_PREFIX pip install --upgrade -r requirements.txt
    fi
    
    # Update Node dependencies
    if [[ -f "package.json" ]]; then
        log_info "Updating Node dependencies..."
        $EXEC_PREFIX npm update
    fi
    
    # Update Rust dependencies
    if [[ -f "Cargo.toml" ]]; then
        log_info "Updating Rust dependencies..."
        $EXEC_PREFIX cargo update
    fi
    
    log_success "Dependency updates complete"
}

# Auto-repair common issues
repair_code() {
    log_info "Starting auto-repair of common issues..."
    
    # Fix Python imports
    if command -v isort &> /dev/null; then
        log_info "Fixing Python import ordering..."
        $EXEC_PREFIX isort . --skip venv --skip __pycache__ || log_warn "isort had issues"
    fi
    
    # Auto-fix Python with autopep8
    if command -v autopep8 &> /dev/null; then
        log_info "Auto-fixing Python code style..."
        $EXEC_PREFIX find . -name "*.py" -not -path "./venv/*" -exec autopep8 --in-place --aggressive {} \;
    fi
    
    # Fix trailing whitespace
    log_info "Removing trailing whitespace..."
    $EXEC_PREFIX find . -type f \( -name "*.py" -o -name "*.sh" -o -name "*.js" -o -name "*.rs" -o -name "*.sol" \) -exec sed -i 's/[[:space:]]*$//' {} \;
    
    # Fix line endings
    log_info "Standardizing line endings..."
    $EXEC_PREFIX find . -type f \( -name "*.py" -o -name "*.sh" -o -name "*.js" \) -exec dos2unix {} \; 2>/dev/null || true
    
    log_success "Auto-repair complete"
}

# Switch and work with branches
manage_branch() {
    local branch="$1"
    
    if [[ -z "$branch" ]]; then
        log_error "Branch name required"
        echo "Usage: $0 branch <branch-name>"
        exit 1
    fi
    
    log_info "Managing branch: $branch"
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[DRY-RUN] Would checkout branch: $branch"
        return
    fi
    
    # Fetch latest
    log_info "Fetching latest from remote..."
    git fetch origin
    
    # Checkout or create branch
    if git rev-parse --verify "$branch" > /dev/null 2>&1; then
        log_info "Checking out existing branch: $branch"
        git checkout "$branch"
    else
        log_info "Creating and checking out new branch: $branch"
        git checkout -b "$branch" "origin/$branch" 2>/dev/null || git checkout -b "$branch"
    fi
    
    # Pull latest changes
    log_info "Pulling latest changes..."
    git pull origin "$branch" || log_warn "Could not pull from origin"
    
    log_success "Branch management complete"
}

# Sync with remote
sync_repo() {
    log_info "Syncing with remote repository..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "[DRY-RUN] Would sync with remote"
        return
    fi
    
    log_info "Fetching from all remotes..."
    git fetch --all
    
    log_info "Pulling latest changes..."
    git pull
    
    log_success "Repository sync complete"
}

# Show repository status
show_status() {
    log_info "Repository Status:"
    echo "=================="
    git status
    echo ""
    echo "Recent Commits:"
    git log --oneline -10
    echo ""
    echo "Branches:"
    git branch -a
}

# Clean temporary files
clean_repo() {
    log_info "Cleaning repository..."
    
    # Python cache
    $EXEC_PREFIX find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    $EXEC_PREFIX find . -type f -name "*.pyc" -delete
    $EXEC_PREFIX find . -type f -name "*.pyo" -delete
    
    # Node cache
    $EXEC_PREFIX rm -rf node_modules/.cache 2>/dev/null || true
    $EXEC_PREFIX rm -rf .npm 2>/dev/null || true
    
    # Rust cache
    if [[ -d "target" ]]; then
        $EXEC_PREFIX rm -rf target 2>/dev/null || true
    fi
    
    # Build artifacts
    $EXEC_PREFIX find . -type f -name "*.o" -delete
    $EXEC_PREFIX find . -type f -name "*.a" -delete
    
    log_success "Repository cleanup complete"
}

# Main execution
case "$COMMAND" in
    format)
        format_code
        ;;
    lint)
        lint_code
        ;;
    security)
        check_security
        ;;
    update-deps)
        update_dependencies
        ;;
    repair)
        repair_code
        ;;
    branch)
        manage_branch "$@"
        ;;
    sync)
        sync_repo
        ;;
    status)
        show_status
        ;;
    clean)
        clean_repo
        ;;
    all)
        format_code
        lint_code
        check_security
        repair_code
        log_success "All operations complete"
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac
