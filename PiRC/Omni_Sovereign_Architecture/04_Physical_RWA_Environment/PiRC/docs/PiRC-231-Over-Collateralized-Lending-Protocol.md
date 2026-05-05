# PiRC-231: Over-Collateralized Lending Protocol

## 1. Executive Summary
This standard defines the official over-collateralized lending protocol for the Pi Network, ensuring that all borrowed assets are backed by a minimum 10M:1 collateral ratio in accordance with PiRC-101 and PiRC-207.

**Dependencies**: PiRC-207, PiRC-101
**Status**: Complete reference implementation

## 2. Architecture
- Over-collateralized debt positions (CDPs)
- Integration with PiRC-207 Registry Layer for Parity Invariant checks
- Dynamic interest rate models based on pool utilization

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC231Lending.sol`
**Soroban**: `contracts/soroban/src/lending.rs`

## 4. Implementation Roadmap
- Phase 1: Core lending and borrowing logic
- Phase 2: Dynamic interest rate curves
- Phase 3: Mainnet integration with Justice Engine
