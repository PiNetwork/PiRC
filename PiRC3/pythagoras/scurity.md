# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in PiRC3, please report it by opening
a private security advisory on this repository (GitHub → **Security** tab →
**Report a vulnerability**), or by contacting the maintainer directly rather
than opening a public issue.

Please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce it
- Any relevant logs, stack traces, or proof-of-concept code

You can expect an initial response within a reasonable timeframe, and we'll
work with you to confirm, fix, and disclose the issue responsibly.

## Current Security Practices

This project currently relies on standard, well-established practices:

- **SQLite database** — no network listener by default; file-level access
  control depends on your deployment environment.
- **Input handling** — numeric inputs are validated/rounded via
  `utils/rounding.py` / `utils/rounding.js` before being persisted.
- **Dependencies** — kept minimal (see `requirements.txt` and `package.json`);
  review and update dependencies regularly for known CVEs.

## A Note on "Quantum" Security Claims

PiRC3 does not currently implement quantum cryptography, post-quantum
encryption, or any quantum-computing-based security mechanism. If a future
version adds real post-quantum cryptographic algorithms (e.g., NIST-standardized
schemes like CRYSTALS-Kyber or CRYSTALS-Dilithium), this document should be
updated to describe exactly which algorithm, library, and version are in use —
not just the word "quantum" as a marketing term.
