#!/usr/bin/env python3
"""
Repository Management Module for Ze0ro99/PiRC
Handles file operations, vulnerability scanning, formatting, repairs, and branch management.
"""

import os
import sys
import json
import subprocess
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import argparse
from datetime import datetime

# Configure logging
logging.basicConfig(
level=logging.INFO,
format='%(asctime)s - %(levelname)s - %(message)s',
handlers=[
logging.FileHandler('.github/logs/repo-manager.log'),
logging.StreamHandler()
]
)
logger = logging.getLogger(__name__)


class LanguageType(Enum):
"""Supported programming languages in the repository."""
PYTHON = "Python"
RUST = "Rust"
SHELL = "Shell"
JAVASCRIPT = "JavaScript"
SOLIDITY = "Solidity"
HTML = "HTML"


@dataclass
class RepositoryConfig:
"""Configuration for repository management."""
owner: str = "Ze0ro99"
repo: str = "PiRC"
dry_run: bool = False
verbose: bool = False
log_dir: str = ".github/logs"

def __post_init__(self):
Path(self.log_dir).mkdir(parents=True, exist_ok=True)


class CommandExecutor:
"""Executes system commands with error handling."""

def __init__(self, dry_run: bool = False, verbose: bool = False):
self.dry_run = dry_run
self.verbose = verbose

def execute(self, cmd: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
"""Execute a command and return exit code, stdout, stderr."""
if self.dry_run:
logger.info(f"[DRY-RUN] Would execute: {' '.join(cmd)}")
return 0, "", ""

if self.verbose:
logger.debug(f"Executing: {' '.join(cmd)}")

try:
result = subprocess.run(
cmd,
cwd=cwd,
capture_output=True,
text=True,
timeout=300
)
return result.returncode, result.stdout, result.stderr
except subprocess.TimeoutExpired:
logger.error(f"Command timed out: {' '.join(cmd)}")
return 1, "", "Command timed out"
except FileNotFoundError:
logger.error(f"Command not found: {cmd[0]}")
return 127, "", f"Command not found: {cmd[0]}"
except Exception as e:
logger.error(f"Error executing command: {e}")
return 1, "", str(e)

def execute_silent(self, cmd: List[str], cwd: Optional[str] = None) -> bool:
"""Execute a command silently and return success status."""
returncode, _, _ = self.execute(cmd, cwd)
return returncode == 0


class FileManager:
"""Manages file operations and formatting."""

def __init__(self, executor: CommandExecutor):
self.executor = executor

def find_files(self, pattern: str, exclude_dirs: Optional[List[str]] = None) -> List[str]:
"""Find files matching pattern, excluding certain directories."""
if exclude_dirs is None:
exclude_dirs = ['node_modules', 'venv', '__pycache__', '.git', 'target']

exclude_args = []
for exclude_dir in exclude_dirs:
exclude_args.extend(['-not', '-path', f'*/{exclude_dir}/*'])

cmd = ['find', '.', '-type', 'f', '-name', pattern] + exclude_args
returncode, stdout, _ = self.executor.execute(cmd)

if returncode == 0:
return [f.strip() for f in stdout.strip().split('\n') if f.strip()]
return []

def format_python(self) -> bool:
"""Format Python files with black and isort."""
logger.info("Formatting Python files...")

success = True

# Black formatting
if self.executor.execute_silent(['which', 'black']):
logger.info("Running Black formatter...")
returncode, _, stderr = self.executor.execute(
['black', '--line-length', '100', '.', '--exclude', 'venv|__pycache__']
)
if returncode != 0:
logger.warning(f"Black formatting issues: {stderr}")
success = False

# isort for import ordering
if self.executor.execute_silent(['which', 'isort']):
logger.info("Running isort...")
returncode, _, stderr = self.executor.execute(
['isort', '.', '--skip', 'venv', '--skip', '__pycache__']
)
if returncode != 0:
logger.warning(f"isort issues: {stderr}")
success = False

return success

def format_rust(self) -> bool:
"""Format Rust files with rustfmt."""
logger.info("Formatting Rust files...")

rust_files = self.find_files('*.rs')
if not rust_files:
logger.info("No Rust files found")
return True

if not self.executor.execute_silent(['which', 'rustfmt']):
logger.warning("rustfmt not found")
return False

returncode, _, stderr = self.executor.execute(
['rustfmt', '--edition', '2021'] + rust_files
)

if returncode == 0:
logger.info("Rust formatting complete")
return True
else:
logger.warning(f"Rust formatting issues: {stderr}")
return False

def format_javascript(self) -> bool:
"""Format JavaScript/TypeScript files with Prettier."""
logger.info("Formatting JavaScript/HTML files...")

if not self.executor.execute_silent(['which', 'prettier']):
logger.warning("Prettier not found")
return False

returncode, _, stderr = self.executor.execute(
['prettier', '--write', '.', '--ignore-path', '.gitignore']
)

if returncode == 0:
logger.info("JavaScript formatting complete")
return True
else:
logger.warning(f"Prettier issues: {stderr}")
return False

def format_shell(self) -> bool:
"""Format shell scripts with shfmt."""
logger.info("Formatting shell scripts...")

shell_files = self.find_files('*.sh')
if not shell_files:
logger.info("No shell scripts found")
return True

if not self.executor.execute_silent(['which', 'shfmt']):
logger.warning("shfmt not found")
return False

returncode, _, stderr = self.executor.execute(
['shfmt', '-i', '4', '-w'] + shell_files
)

if returncode == 0:
logger.info("Shell script formatting complete")
return True
else:
logger.warning(f"shfmt issues: {stderr}")
return False

def remove_trailing_whitespace(self) -> bool:
"""Remove trailing whitespace from all code files."""
logger.info("Removing trailing whitespace...")

file_patterns = ['*.py', '*.sh', '*.js', '*.ts', '*.rs', '*.sol', '*.html']

for pattern in file_patterns:
files = self.find_files(pattern)
for file_path in files:
try:
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
content = f.read()

fixed_content = '\n'.join(line.rstrip() for line in content.split('\n'))

if content != fixed_content and not self.executor.dry_run:
with open(file_path, 'w', encoding='utf-8') as f:
f.write(fixed_content)
except Exception as e:
logger.warning(f"Could not fix whitespace in {file_path}: {e}")

logger.info("Trailing whitespace removal complete")
return True

def standardize_line_endings(self) -> bool:
"""Standardize line endings to LF."""
logger.info("Standardizing line endings to LF...")

file_patterns = ['*.py', '*.sh', '*.js', '*.ts', '*.rs', '*.sol']

for pattern in file_patterns:
files = self.find_files(pattern)
for file_path in files:
try:
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
content = f.read()

fixed_content = content.replace('\r\n', '\n').replace('\r', '\n')

if content != fixed_content and not self.executor.dry_run:
with open(file_path, 'w', encoding='utf-8', newline='') as f:
f.write(fixed_content)
except Exception as e:
logger.warning(f"Could not fix line endings in {file_path}: {e}")

logger.info("Line ending standardization complete")
return True


class CodeAnalyzer:
"""Analyzes code for issues and vulnerabilities."""

def __init__(self, executor: CommandExecutor):
self.executor = executor

def lint_python(self) -> Dict[str, bool]:
"""Run Python linters."""
logger.info("Linting Python files...")
results = {}

# pylint
if self.executor.execute_silent(['which', 'pylint']):
logger.info("Running pylint...")
returncode, _, _ = self.executor.execute(['pylint', '--exit-zero', '.'])
results['pylint'] = returncode == 0

# flake8
if self.executor.execute_silent(['which', 'flake8']):
logger.info("Running flake8...")
returncode, _, _ = self.executor.execute(
['flake8', '.', '--exclude=venv,__pycache__']
)
results['flake8'] = returncode == 0

return results

def lint_rust(self) -> Dict[str, bool]:
"""Run Rust linters."""
logger.info("Linting Rust files...")
results = {}

if not self.executor.execute_silent(['which', 'cargo']):
logger.warning("Cargo not found")
return results

# cargo clippy
cargo_file = self._find_cargo_file()
if cargo_file:
cargo_dir = os.path.dirname(cargo_file)
returncode, _, _ = self.executor.execute(
['cargo', 'clippy', '--all-targets', '--all-features'],
cwd=cargo_dir
)
results['clippy'] = returncode == 0

return results

def lint_javascript(self) -> Dict[str, bool]:
"""Run JavaScript linters."""
logger.info("Linting JavaScript files...")
results = {}

if not self.executor.execute_silent(['which', 'eslint']):
logger.warning("eslint not found")
return results

returncode, _, _ = self.executor.execute(['eslint', '.', '--exit-0'])
results['eslint'] = returncode == 0

return results

def lint_shell(self) -> Dict[str, bool]:
"""Run shell script linters."""
logger.info("Linting shell scripts...")
results = {}

if not self.executor.execute_silent(['which', 'shellcheck']):
logger.warning("shellcheck not found")
return results

shell_files = []
returncode, stdout, _ = self.executor.execute(['find', '.', '-type', 'f', '-name', '*.sh'])
if returncode == 0:
shell_files = [f.strip() for f in stdout.strip().split('\n') if f.strip()]

if shell_files:
returncode, _, _ = self.executor.execute(['shellcheck'] + shell_files)
results['shellcheck'] = returncode == 0

return results

def check_security(self) -> Dict[str, bool]:
"""Check for security vulnerabilities."""
logger.info("Performing security checks...")
results = {}

# Python security
if self.executor.execute_silent(['which', 'safety']):
logger.info("Checking Python dependencies with Safety...")
returncode, _, _ = self.executor.execute(['safety', 'check', '--json', '--exit-code=0'])
results['python-safety'] = returncode == 0

# Node security
if self.executor.execute_silent(['which', 'npm']) and os.path.exists('package.json'):
logger.info("Checking Node dependencies...")
returncode, _, _ = self.executor.execute(['npm', 'audit', '--audit-level=moderate'])
results['npm-audit'] = returncode == 0

# Rust security
if self.executor.execute_silent(['which', 'cargo']) and os.path.exists('Cargo.toml'):
logger.info("Checking Rust dependencies...")
returncode, _, _ = self.executor.execute(['cargo', 'audit', '--deny=warnings'])
results['cargo-audit'] = returncode == 0

# Solidity security
if self.executor.execute_silent(['which', 'slither']):
logger.info("Checking Solidity smart contracts...")
returncode, _, _ = self.executor.execute(['slither', '.', '--exit-zero'])
results['solidity-slither'] = returncode == 0

# Secret scanning
if self.executor.execute_silent(['which', 'truffleHog']):
logger.info("Scanning for secrets...")
returncode, _, _ = self.executor.execute(['truffleHog', 'filesystem', '.', '--json'])
results['secrets'] = returncode == 0

return results

def _find_cargo_file(self) -> Optional[str]:
"""Find Cargo.toml file."""
returncode, stdout, _ = self.executor.execute(['find', '.', '-name', 'Cargo.toml', '-type', 'f'])
if returncode == 0:
files = [f.strip() for f in stdout.strip().split('\n') if f.strip()]
return files[0] if files else None
return None


class BranchManager:
"""Manages git branches and synchronization."""

def __init__(self, executor: CommandExecutor):
self.executor = executor

def list_branches(self) -> List[str]:
"""List all branches."""
returncode, stdout, _ = self.executor.execute(['git', 'branch', '-a'])
if returncode == 0:
return [line.strip().lstrip('* ') for line in stdout.strip().split('\n') if line.strip()]
return []

def checkout_branch(self, branch: str) -> bool:
"""Checkout a specific branch."""
logger.info(f"Checking out branch: {branch}")

# Fetch latest
self.executor.execute(['git', 'fetch', 'origin'])

# Check if branch exists locally
returncode, _, _ = self.executor.execute(['git', 'rev-parse', '--verify', branch])

if returncode == 0:
# Branch exists
returncode, _, _ = self.executor.execute(['git', 'checkout', branch])
else:
# Try to create from remote
returncode, _, _ = self.executor.execute(
['git', 'checkout', '-b', branch, f'origin/{branch}']
)

if returncode == 0:
# Pull latest changes
self.executor.execute(['git', 'pull', 'origin', branch])
logger.info(f"Successfully checked out branch: {branch}")
return True
else:
logger.error(f"Failed to checkout branch: {branch}")
return False

def sync_with_remote(self) -> bool:
"""Sync repository with remote."""
logger.info("Syncing with remote repository...")

# Fetch all remotes
returncode, _, _ = self.executor.execute(['git', 'fetch', '--all'])
if returncode != 0:
logger.error("Failed to fetch from remote")
return False

# Pull latest changes
returncode, _, _ = self.executor.execute(['git', 'pull'])
if returncode != 0:
logger.warning("Pull encountered conflicts or issues")
return False

logger.info("Repository sync complete")
return True

def get_current_branch(self) -> str:
"""Get current branch name."""
returncode, stdout, _ = self.executor.execute(['git', 'rev-parse', '--abbrev-ref', 'HEAD'])
if returncode == 0:
return stdout.strip()
return "unknown"

def get_status(self) -> str:
"""Get git status."""
returncode, stdout, _ = self.executor.execute(['git', 'status'])
return stdout if returncode == 0 else "Unable to get status"


class RepositoryManager:
"""Main repository manager orchestrating all operations."""

def __init__(self, config: RepositoryConfig):
self.config = config
self.executor = CommandExecutor(config.dry_run, config.verbose)
self.file_manager = FileManager(self.executor)
self.analyzer = CodeAnalyzer(self.executor)
self.branch_manager = BranchManager(self.executor)

def format_all(self) -> bool:
"""Format all code files."""
logger.info("Starting code formatting...")

results = []
results.append(("Python", self.file_manager.format_python()))
results.append(("Rust", self.file_manager.format_rust()))
results.append(("JavaScript", self.file_manager.format_javascript()))
results.append(("Shell", self.file_manager.format_shell()))
results.append(("Whitespace", self.file_manager.remove_trailing_whitespace()))
results.append(("Line Endings", self.file_manager.standardize_line_endings()))

self._print_results("Formatting Results", results)
return all(result[1] for result in results)

def lint_all(self) -> bool:
"""Lint all code files."""
logger.info("Starting code analysis...")

all_results = {}
all_results.update(self.analyzer.lint_python())
all_results.update(self.analyzer.lint_rust())
all_results.update(self.analyzer.lint_javascript())
all_results.update(self.analyzer.lint_shell())

results = [(k, v) for k, v in all_results.items()]
self._print_results("Lint Results", results)

return all(all_results.values()) if all_results else True

def security_check(self) -> bool:
"""Check for security issues."""
logger.info("Starting security analysis...")

results_dict = self.analyzer.check_security()
results = [(k, v) for k, v in results_dict.items()]
self._print_results("Security Check Results", results)

return all(results_dict.values()) if results_dict else True

def clean_cache(self) -> bool:
"""Clean temporary files and caches."""
logger.info("Cleaning repository caches...")

# Python cache
self.executor.execute(['find', '.', '-type', 'd', '-name', '__pycache__', '-exec', 'rm', '-rf', '{}', '+'], )
self.executor.execute(['find', '.', '-type', 'f', '-name', '*.pyc', '-delete'])

# Node cache
if os.path.exists('node_modules'):
self.executor.execute(['rm', '-rf', 'node_modules/.cache'])

# Rust cache
if os.path.exists('target'):
self.executor.execute(['rm', '-rf', 'target'])

logger.info("Cache cleanup complete")
return True

def show_status(self) -> None:
"""Display repository status."""
logger.info("Repository Status")
print("\n" + "="*60)
print(f"Repository: {self.config.owner}/{self.config.repo}")
print(f"Current Branch: {self.branch_manager.get_current_branch()}")
print(f"Timestamp: {datetime.now().isoformat()}")
print("="*60)
print("\nGit Status:")
print(self.branch_manager.get_status())
print("\n" + "="*60)

def _print_results(self, title: str, results: List[Tuple[str, bool]]) -> None:
"""Print formatted results."""
print(f"\n{title}:")
print("-" * 40)
for name, success in results:
status = "✓ PASS" if success else "✗ FAIL"
print(f"{name:<30} {status}")
print("-" * 40 + "\n")


def main():
"""Main entry point."""
parser = argparse.ArgumentParser(
description="Repository Manager for Ze0ro99/PiRC",
formatter_class=argparse.RawDescriptionHelpFormatter,
epilog="""
Examples:
python repo_manager.py format
python repo_manager.py lint --verbose
python repo_manager.py security
python repo_manager.py all --dry-run
python repo_manager.py branch main
python repo_manager.py sync
"""
)

parser.add_argument(
'command',
nargs='?',
default='help',
choices=['format', 'lint', 'security', 'clean', 'all', 'status', 'branch', 'sync', 'help'],
help='Command to execute'
)

parser.add_argument(
'branch',
nargs='?',
help='Branch name (for branch command)'
)

parser.add_argument(
'-v', '--verbose',
action='store_true',
help='Verbose output'
)

parser.add_argument(
'-d', '--dry-run',
action='store_true',
help='Show what would be done without making changes'
)

args = parser.parse_args()

config = RepositoryConfig(dry_run=args.dry_run, verbose=args.verbose)
manager = RepositoryManager(config)

try:
if args.command == 'format':
success = manager.format_all()
elif args.command == 'lint':
success = manager.lint_all()
elif args.command == 'security':
success = manager.security_check()
elif args.command == 'clean':
success = manager.clean_cache()
elif args.command == 'all':
manager.format_all()
manager.lint_all()
manager.security_check()
success = True
elif args.command == 'status':
manager.show_status()
success = True
elif args.command == 'branch':
if not args.branch:
parser.error("branch command requires a branch name")
success = manager.branch_manager.checkout_branch(args.branch)
elif args.command == 'sync':
success = manager.branch_manager.sync_with_remote()
else:
parser.print_help()
success = True

sys.exit(0 if success else 1)

except KeyboardInterrupt:
logger.info("Operation cancelled by user")
sys.exit(130)
except Exception as e:
logger.error(f"Unexpected error: {e}", exc_info=True)
sys.exit(1)


if __name__ == '__main__':
main()
