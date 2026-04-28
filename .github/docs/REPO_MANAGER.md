# Repository Manager Documentation

## Overview

The Repository Manager is a comprehensive automation suite for Ze0ro99/PiRC that handles:
- Code formatting and style compliance
- Linting and code quality analysis
- Security vulnerability scanning
- Git branch management
- Dependency updates
- Automated repairs and cleanup

## Quick Start

### Using the Bash Script

```bash
# Format all code
chmod +x .github/scripts/repo-manager.sh
./.github/scripts/repo-manager.sh format

# Run all operations
./.github/scripts/repo-manager.sh all

# With verbose output
./.github/scripts/repo-manager.sh lint --verbose

# Dry-run mode (no changes made)
./.github/scripts/repo-manager.sh security --dry-run
```

### Using the Python Module

```bash
# Format all code
python .github/scripts/repo_manager.py format

# Run security checks
python .github/scripts/repo_manager.py security --verbose

# Manage branches
python .github/scripts/repo_manager.py branch main

# Dry-run mode
python .github/scripts/repo_manager.py all --dry-run
```

## Commands

### format
Formats code according to language-specific standards:
- **Python**: Black (line length 100) + isort
- **Rust**: rustfmt (edition 2021)
- **JavaScript/HTML**: Prettier
- **Shell**: shfmt (4-space indent)

```bash
./repo-manager.sh format
python repo_manager.py format
```

### lint
Runs linters on code to identify issues:
- **Python**: pylint, flake8
- **Rust**: clippy
- **JavaScript**: eslint
- **Shell**: shellcheck

```bash
./repo-manager.sh lint
python repo_manager.py lint
```

### security
Performs comprehensive security vulnerability scanning:
- **Python**: Safety (dependency check), Bandit (code analysis)
- **Node**: npm audit
- **Rust**: cargo audit
- **Solidity**: Slither (smart contract analysis)
- **Secrets**: TruffleHog (secret scanning)

```bash
./repo-manager.sh security
python repo_manager.py security
```

### update-deps
Updates all project dependencies:
- Python: pip install --upgrade
- Node: npm update
- Rust: cargo update

```bash
./repo-manager.sh update-deps
```

### repair
Automatically fixes common code issues:
- Python import ordering (isort)
- Python code style (autopep8)
- Trailing whitespace removal
- Line ending standardization (LF)

```bash
./repo-manager.sh repair
python repo_manager.py repair
```

### branch <branch-name>
Manages git branches:
- Fetches from origin
- Checks out or creates branch
- Pulls latest changes

```bash
./repo-manager.sh branch develop
python repo_manager.py branch feature/new-feature
```

### sync
Synchronizes repository with remote:
- Fetches all remotes
- Pulls latest changes
- Resolves conflicts if possible

```bash
./repo-manager.sh sync
python repo_manager.py sync
```

### status
Displays current repository status:
- Current branch
- Uncommitted changes
- Recent commits
- Available branches

```bash
./repo-manager.sh status
python repo_manager.py status
```

### clean
Removes temporary files and caches:
- Python: `__pycache__`, `.pyc`, `.pyo` files
- Node: `node_modules/.cache`
- Rust: `target/` directory
- Build artifacts

```bash
./repo-manager.sh clean
python repo_manager.py clean
```

### all
Executes format, lint, security check, and repair in sequence:

```bash
./repo-manager.sh all
python repo_manager.py all
```

## Options

### --verbose, -v
Provides detailed output for debugging:
```bash
./repo-manager.sh format --verbose
python repo_manager.py lint -v
```

### --dry-run, -d
Shows what would be done without making changes:
```bash
./repo-manager.sh all --dry-run
python repo_manager.py format -d
```

## Configuration

Configuration is managed in `.github/config/repo_config.py`:

- **LANGUAGE_CONFIGS**: Language-specific tool configurations
- **SECURITY_CONFIG**: Security scanning settings
- **FORMATTING_CONFIG**: Formatter options (line length, indent, etc.)
- **LINTING_CONFIG**: Linter configurations and rules
- **GIT_CONFIG**: Git defaults and branch protection
- **CICD_CONFIG**: GitHub Actions and pre-commit settings

## GitHub Actions Integration

The workflow `.github/workflows/maintenance.yml` provides:

### Scheduled Execution
- Runs weekly on Sundays at 2 AM UTC
- Automatically creates PR with formatting changes

### Manual Trigger
- Dispatch workflow via GitHub Actions UI
- Select operation: format, lint, security, clean, or all

### Features
- Automatic PR creation with formatting changes
- Detailed job logs and reporting
- Security scan results uploaded to GitHub

## Supported Languages

| Language | Formatter | Linter | Security |
|----------|-----------|--------|----------|
| Python | Black, isort | pylint, flake8 | Safety, Bandit |
| Rust | rustfmt | clippy | cargo audit |
| JavaScript | Prettier | eslint | npm audit |
| Shell | shfmt | shellcheck | N/A |
| HTML | Prettier | N/A | N/A |
| Solidity | N/A | solhint | Slither |

## Installation

### Prerequisites
```bash
# Python tools
pip install black isort autopep8 pylint flake8 safety bandit

# Node tools
npm install -g prettier eslint

# Rust (if applicable)
rustup component add rustfmt clippy
cargo install cargo-audit

# System tools
sudo apt-get install shellcheck shfmt  # Ubuntu/Debian
brew install shellcheck shfmt           # macOS
```

### Setup
```bash
# Clone repository
git clone https://github.com/Ze0ro99/PiRC.git
cd PiRC

# Make scripts executable
chmod +x .github/scripts/repo-manager.sh

# Create logs directory
mkdir -p .github/logs
```

## Examples

### Daily Development Workflow
```bash
# Format and check code before commit
./repo-manager.sh format
./repo-manager.sh lint
git add .
git commit -m "chore: format code"
```

### Security Audit
```bash
# Check for vulnerabilities
python repo_manager.py security --verbose
```

### Branch Management
```bash
# Switch to develop and update
python repo_manager.py branch develop

# Switch to feature branch
python repo_manager.py branch feature/new-feature

# Sync with remote
python repo_manager.py sync
```

### Prepare Release
```bash
# Full maintenance before release
python repo_manager.py all --verbose
python repo_manager.py update-deps
python repo_manager.py branch release/v1.0.0
```

## Troubleshooting

### Tools Not Found
Ensure all required tools are installed:
```bash
which black rustfmt prettier eslint shellcheck
```

### Permission Denied
Make scripts executable:
```bash
chmod +x .github/scripts/repo-manager.sh
```

### Git Conflicts
If sync encounters conflicts:
```bash
git status
git resolve  # Handle conflicts manually
python repo_manager.py sync
```

### Dry-Run Not Working
Use with actual changes to see full output:
```bash
python repo_manager.py all --dry-run --verbose
```

## Logging

All operations are logged to `.github/logs/repo-manager.log`:
- DEBUG: Detailed operation information
- INFO: General operation messages
- WARNING: Non-critical issues
- ERROR: Critical failures

View logs:
```bash
tail -f .github/logs/repo-manager.log
```

## Contributing

To extend the repository manager:

1. Add new tools to `.github/config/repo_config.py`
2. Implement new methods in Python classes
3. Add corresponding shell script functions
4. Update this documentation
5. Test with `--dry-run` flag

## Support

For issues or questions:
- Check logs in `.github/logs/`
- Run with `--verbose` flag for details
- Review GitHub Actions workflow logs
- Open an issue on the repository

---

**Repository**: Ze0ro99/PiRC  
**Last Updated**: 2026-04-24
