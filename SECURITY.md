# Security Policy

## Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub Issues.**

Instead, email security@pidctp.org with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Bug Bounty Program

| Severity | Reward | Criteria |
|----------|--------|----------|
| **Critical** | 5,000 Pi | Fund loss, governance takeover, complete protocol compromise |
| **High** | 2,000 Pi | State corruption, access control bypass, significant logic errors |
| **Medium** | 500 Pi | DoS vectors, minor logic errors, non-critical state issues |
| **Low** | 100 Pi | Gas optimization, minor issues with no practical impact |

## Security Features

### Smart Contract Level
- Checks-Effects-Interactions pattern enforced
- No admin override for escrow funds or dispute outcomes
- Emergency pause available for critical vulnerabilities
- 48-hour timelock on all contract upgrades

### Protocol Level
- 3-of-5 admin multi-sig for upgrades
- Fee ceiling (10% max) enforced at protocol level
- Reputation score bounds (50-1000) enforced on-chain

### v1.1: Defense-in-Depth
- Sybil scoring with on-chain pattern analysis
- Soulbound Badges (non-transferable reputation credentials)
- Juror vetting with minimum reputation + stake requirements
- Commit-reveal voting to prevent collusion
- Reputation-weighted voting for dispute rulings

## Responsible Disclosure

- Do not publicly disclose vulnerabilities until a patch is deployed
- Allow reasonable time for the team to respond and fix the issue
- Do not exploit vulnerabilities for personal gain

## Scope

### In Scope
- All smart contracts in `contracts/`
- Shared types and storage key logic
- Authorization and access control
- Fund handling and token transfers

### Out of Scope
- Frontend applications
- Off-chain services
- Social engineering attacks
- Issues in third-party dependencies (report upstream)
