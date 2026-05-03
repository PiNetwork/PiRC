# PiRC-239: Institutional Liquidity Pools

## 1. Executive Summary
This standard defines permissioned liquidity pools designed specifically for wholesale capital and institutional actors. It strictly enforces PiRC-209 DID and PiRC-217 KYC requirements at the protocol level.

**Dependencies**: PiRC-209, PiRC-217, PiRC-231
**Status**: Complete reference implementation

## 2. Architecture
- Permissioned deposit and borrow functions
- Whitelist and blacklist management via DID
- Segregated liquidity for regulatory compliance

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC239InstitutionalPools.sol`
**Soroban**: `contracts/soroban/src/institutional_pools.rs`

## 4. Implementation Roadmap
- Phase 1: DID/KYC gated access controls
- Phase 2: Institutional pool deployment
- Phase 3: Cross-chain wholesale routing
