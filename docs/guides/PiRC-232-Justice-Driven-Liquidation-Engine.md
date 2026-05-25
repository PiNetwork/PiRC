# PiRC-232: Justice-Driven Liquidation Engine

## 1. Executive Summary
This standard establishes the liquidation engine for undercollateralized positions, directly tied to the PiRC-228 Justice Engine to ensure fair, transparent, and parity-safe liquidations.

**Dependencies**: PiRC-231, PiRC-228
**Status**: Complete reference implementation

## 2. Architecture
- Health factor monitoring
- Justice Engine validation for liquidation triggers
- Penalty distribution to ecosystem treasury

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC232Liquidation.sol`
**Soroban**: `contracts/soroban/src/liquidation.rs`

## 4. Implementation Roadmap
- Phase 1: Health factor calculations
- Phase 2: Justice Engine integration
- Phase 3: Automated keeper incentives
