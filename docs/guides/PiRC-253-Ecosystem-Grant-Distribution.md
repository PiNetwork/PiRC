# PiRC-253: Ecosystem Grant Distribution Algorithms

## 1. Executive Summary
This standard formalizes the distribution of ecosystem grants. It replaces manual payouts with algorithmic, milestone-based vesting schedules tied to on-chain KPIs (e.g., TVL, active users, or code commits).

**Dependencies**: PiRC-212, PiRC-220
**Status**: Complete reference implementation

## 2. Architecture
- Milestone-based vesting contracts
- KPI oracle integration for automated unlocks
- Clawback mechanisms for failed deliverables

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC253GrantDistribution.sol`
**Soroban**: `contracts/soroban/src/grant_distribution.rs`

## 4. Implementation Roadmap
- Phase 1: Time-based vesting schedules
- Phase 2: KPI-driven automated unlocks
- Phase 3: Decentralized milestone verification
