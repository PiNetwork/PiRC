# PiRC-236: Dynamic Interest Rate Curves

## 1. Executive Summary
This standard defines the algorithmic interest rate models for Pi Network lending protocols. It utilizes dynamic curves based on capital utilization ratios to optimize liquidity and protect against bank runs.

**Dependencies**: PiRC-231
**Status**: Complete reference implementation

## 2. Architecture
- Utilization ratio calculation (Borrowed / Total Liquidity)
- Kinked interest rate models (Base rate + Multiplier)
- Spike rates for extreme utilization (protecting reserves)

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC236InterestRates.sol`
**Soroban**: `contracts/soroban/src/interest_rates.rs`

## 4. Implementation Roadmap
- Phase 1: Linear interest rate models
- Phase 2: Kinked curve implementation
- Phase 3: AI-driven dynamic curve adjustments (via PiRC-237)
