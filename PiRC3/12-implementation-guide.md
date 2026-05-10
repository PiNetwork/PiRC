# PiRC3 Section 12: Implementation Guide

## Technical Stack

- **Smart Contracts**: Rust + Soroban SDK (Stellar blockchain)
- **Token Standard**: Stellar Classic Asset (Pi)
- **Randomness**: Verifiable Random Function (VRF) for juror selection
- **Privacy (roadmap)**: Zero-Knowledge Proofs (ZK-SNARKs)

## Project Structure

```
contracts/
├── shared/          # Shared types & events
├── escrow/          # Escrow + Milestone + Group Escrow
├── reputation/      # Reputation + Badges + Attestations + Sybil + ZK
├── dispute/         # Dispute + Juror Vetting + Weighted Voting
├── merchant/        # Merchant verification
├── loyalty/         # Loyalty & rewards
└── coordinator/     # Entry point & router
```

## Build & Test

```bash
# Build all contracts
soroban contract build

# Run unit tests
cargo test

# Run integration tests
cargo test --test full_flow_test
```

## Deployment

### Testnet
```bash
./scripts/deploy_testnet.sh
```

### Mainnet
```bash
# Pre-deployment checklist
./scripts/verify_deployment.sh
./scripts/deploy_mainnet.sh
```

## Configuration

| Parameter | Testnet | Mainnet |
|-----------|---------|---------|
| Fee | 1% | 1% |
| Evidence duration | 72h | 72h |
| Voting duration | 48h | 48h |
| Reveal duration | 24h | 24h |
| Appeal window | 24h | 24h |
| Dispute fee | 1 Pi | 1 Pi |
| Appeal fee | 2 Pi | 2 Pi |
| Juror count | 3 | 5 |
| Admin threshold | 2-of-3 | 3-of-5 |

## Upgrade Process

1. Deploy new contract version
2. Submit upgrade transaction with 48h timelock
3. Multi-sig approval (3-of-5 on mainnet)
4. Wait for timelock expiry
5. Execute upgrade
6. Verify deployment with `verify_deployment.sh`
