"""
Configuration for repository management tools.
"""

import os
from pathlib import Path
from typing import Dict, List

# Repository Configuration
REPO_CONFIG = {
"owner": "Ze0ro99",
"repo": "PiRC",
"description": "Pi Requests for Comment",
}

# Language-specific configurations
LANGUAGE_CONFIGS = {
"Python": {
"extensions": ["*.py"],
"formatters": ["black", "isort"],
"linters": ["pylint", "flake8"],
"test_framework": "pytest",
"exclude_dirs": ["venv", "__pycache__", ".pytest_cache", ".mypy_cache"]
},
"Rust": {
"extensions": ["*.rs"],
"formatters": ["rustfmt"],
"linters": ["clippy"],
"test_framework": "cargo test",
"exclude_dirs": ["target"]
},
"Shell": {
"extensions": ["*.sh"],
"formatters": ["shfmt"],
"linters": ["shellcheck"],
"exclude_dirs": []
},
"JavaScript": {
"extensions": ["*.js", "*.ts", "*.jsx", "*.tsx"],
"formatters": ["prettier"],
"linters": ["eslint"],
"exclude_dirs": ["node_modules", ".next", "dist", "build"]
},
"HTML": {
"extensions": ["*.html", "*.htm"],
"formatters": ["prettier"],
"exclude_dirs": []
},
"Solidity": {
"extensions": ["*.sol"],
"linters": ["slither", "solhint"],
"exclude_dirs": ["node_modules"]
}
}

# Global exclude patterns
GLOBAL_EXCLUDE_DIRS = [
".git",
".github",
"node_modules",
"venv",
".venv",
"__pycache__",
".pytest_cache",
".mypy_cache",
"target",
"dist",
"build",
".next",
".env",
".env.local"
]

# Security scanning configuration
SECURITY_CONFIG = {
"python": {
"tools": ["safety", "bandit"],
"requirements_files": ["requirements.txt", "requirements-dev.txt", "setup.py", "pyproject.toml"]
},
"node": {
"tools": ["npm audit", "yarn audit"],
"manifest_files": ["package.json", "package-lock.json", "yarn.lock"]
},
"rust": {
"tools": ["cargo audit", "cargo-deny"],
"manifest_files": ["Cargo.toml", "Cargo.lock"]
},
"secrets": {
"tools": ["truffleHog", "git-secrets"],
"scan_patterns": [
r"password\s*=",
r"api[_-]?key\s*=",
r"secret\s*=",
r"token\s*="
]
}
}

# Formatting configuration
FORMATTING_CONFIG = {
"python": {
"black": {
"line_length": 100,
"skip_string_normalization": False,
"target_version": ["py39", "py310", "py311"]
},
"isort": {
"profile": "black",
"multi_line_mode": 3,
"include_trailing_comma": True
}
},
"javascript": {
"prettier": {
"semi": True,
"trailingComma": "es5",
"singleQuote": True,
"printWidth": 100,
"tabWidth": 2
}
},
"rust": {
"rustfmt": {
"edition": "2021",
"max_width": 100
}
},
"shell": {
"shfmt": {
"indent": 4,
"binary_next_line": False
}
}
}

# Linting configuration
LINTING_CONFIG = {
"python": {
"pylint": {
"disable": ["C0111", "R0913", "R0914"],
"max_line_length": 100
},
"flake8": {
"max_line_length": 100,
"ignore": ["E203", "W503"]
}
},
"javascript": {
"eslint": {
"extends": ["eslint:recommended"],
"rules": {
"indent": ["error", 2],
"linebreak-style": ["error", "unix"],
"quotes": ["error", "single"],
"semi": ["error", "always"]
}
}
}
}

# Git configuration
GIT_CONFIG = {
"remote": "origin",
"default_branch": "main",
"protected_branches": ["main", "develop"],
"commit_message_pattern": r"^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?!?: .+",
}

# CI/CD Configuration
CICD_CONFIG = {
"github_actions": {
"workflows_dir": ".github/workflows",
"scripts_dir": ".github/scripts",
"logs_dir": ".github/logs"
},
"pre_commit_hooks": {
"enabled": True,
"hooks": [
"trailing-whitespace",
"end-of-file-fixer",
"check-yaml",
"check-merge-conflict"
]
}
}

# Logging configuration
LOGGING_CONFIG = {
"version": 1,
"disable_existing_loggers": False,
"formatters": {
"standard": {
"format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
},
"detailed": {
"format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s"
}
},
"handlers": {
"console": {
"class": "logging.StreamHandler",
"level": "INFO",
"formatter": "standard"
},
"file": {
"class": "logging.handlers.RotatingFileHandler",
"level": "DEBUG",
"formatter": "detailed",
"filename": ".github/logs/repo-manager.log",
"maxBytes": 10485760,
"backupCount": 5
}
},
"loggers": {
"": {
"level": "DEBUG",
"handlers": ["console", "file"]
}
}
}

# Branch management configuration
BRANCH_CONFIG = {
"naming_convention": r"^(feature|bugfix|hotfix|release|docs|refactor)/[\w-]+$",
"auto_cleanup_merged": True,
"protected_branches": ["main", "develop"],
"require_pr_reviews": 2,
"require_status_checks": True
}


def get_excluded_dirs() -> List[str]:
"""Get list of all excluded directories."""
excluded = list(GLOBAL_EXCLUDE_DIRS)
for lang_config in LANGUAGE_CONFIGS.values():
if "exclude_dirs" in lang_config:
excluded.extend(lang_config["exclude_dirs"])
return list(set(excluded))


def get_language_config(language: str) -> Dict:
"""Get configuration for a specific language."""
return LANGUAGE_CONFIGS.get(language, {})


def ensure_log_directory():
"""Ensure log directory exists."""
log_dir = Path(CICD_CONFIG["github_actions"]["logs_dir"])
log_dir.mkdir(parents=True, exist_ok=True)
