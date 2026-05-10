# PiRC3 Section 11: Security Model

## Threat Analysis

| Threat | Mitigation |
|--------|-----------|
| Fund theft | Checks-Effects-Interactions; no admin override |
| Front-running | Commit-reveal voting; hidden jurors |
| Sybil attacks | Social graph analysis; stake requirements; badge non-transferability |
| Juror collusion | Commit-reveal; weighted voting; consensus tracking |
| Reputation farming | Sybil scoring; attestation weight limits; decay mechanism |
| Governance takeover | Timelock; multi-sig; progressive decentralization |
| Flash loan attacks | No price oracles; no instant governance |
| Reentrancy | All state changes before external calls |

## Security Features

### Smart Contract Level
- **Checks-Effects-Interactions**: All state changes before external token transfers
- **No admin override**: Admins cannot move funds or change escrow outcomes
- **Emergency pause**: Available for critical vulnerabilities only
- **Timelock**: 48-hour delay on all contract upgrades

### Protocol Level
- **3-of-5 admin multi-sig**: Required for upgrades and parameter changes
- **Fee ceiling**: Maximum 10% fee enforced at protocol level
- **Score bounds**: Reputation score clamped to 50-1000 range

### v1.1: Defense-in-Depth

| Attack | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| Sybil farming | Sybil scoring | Attestation limits | Badge non-transferability |
| Reputation buying | Soulbound badges | Attestation expiry | Counterparty tracking |
| Juror collusion | Commit-reveal | Weighted voting | Consensus tracking |
| Vote copying | Commit-reveal | Hidden jurors | Vetting requirements |

## Bug Bounty Program

| Severity | Reward | Criteria |
|----------|--------|----------|
| Critical | 5,000 Pi | Fund loss, governance takeover |
| High | 2,000 Pi | State corruption, bypass |
| Medium | 500 Pi | Logic errors, DoS |
| Low | 100 Pi | Minor issues, gas optimization |

## Responsible Disclosure

Report vulnerabilities to security@pidctp.org. Do not publicly disclose until patch is deployed.
