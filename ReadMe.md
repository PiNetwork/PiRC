# PiRC — Pi Requests for Comment

This repository contains PiRC proposals for the Pi Network ecosystem, defining standards for token economics, subscription payments, and decentralized commerce trust infrastructure.

## Proposals

- [PiRC1: Pi Ecosystem Token Design](./PiRC1/ReadMe.md) — Token allocation & economics
- [PiRC2: Subscription Contract API](./PiRC2/ReadMe.md) — Recurring payments
- [PiRC3: Pi Decentralized Commerce & Trust Protocol (PiDCTP)](./PiRC3/ReadMe.md) — Escrow, Reputation, Dispute Resolution, Merchant Verification, Loyalty + 7 Advanced Innovations

## PiRC3 Highlight

PiRC3 introduces a complete **decentralized commerce trust layer** for the Pi ecosystem:

| Module | Description |
|--------|-------------|
| **Escrow** | Multi-sig payment protection with milestone & group escrow |
| **Reputation** | Verifiable on-chain trust scores with Soulbound Badges (SBTs) |
| **Dispute** | Decentralized arbitration with vetted, reputation-weighted jurors |
| **Merchant** | 3-level KYB verification for business legitimacy |
| **Loyalty** | Economic incentives for honest commerce |

### 7 Advanced Innovations (v1.1)

Soulbound Badges · Milestone Escrow · Group Escrow · Sybil Resistance · Juror Vetting · Reputation Attestations · ZK Verification Roadmap

### Smart Contracts

6 production-ready Soroban (Rust) contracts with shared types and unit tests:

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

## Quick Start

```bash
git clone https://github.com/PiNetwork/PiRC.git
cd PiRC
cargo test        # Run all contract tests
```

## Technical Stack

- **Smart Contracts**: Rust + Soroban SDK (Stellar)
- **Token Standard**: Stellar Classic Asset (Pi)
- **Randomness**: VRF for juror selection
- **Privacy (roadmap)**: ZK-SNARKs for reputation verification

## Community Feedback

Pioneers are encouraged to review the specification documents, open GitHub Issues, and submit Pull Requests. Pi will review and consider community input.

## License

MIT License — see [LICENSE](LICENSE) for details.