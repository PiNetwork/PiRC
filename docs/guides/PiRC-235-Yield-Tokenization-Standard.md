# PiRC-235: Yield Tokenization Standard

## 1. Executive Summary
This standard allows for the separation of an asset's principal and its future yield into distinct, tradable tokens (Principal Tokens and Yield Tokens).

**Dependencies**: PiRC-207, PiRC-234
**Status**: Complete reference implementation

## 2. Architecture
- Principal Token (PT) and Yield Token (YT) minting
- Time-decaying yield models
- Redemption mechanisms upon maturity

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC235YieldTokenization.sol`
**Soroban**: `contracts/soroban/src/yield_tokenization.rs`

## 4. Implementation Roadmap
- Phase 1: PT and YT separation logic
- Phase 2: Secondary market AMM integration
- Phase 3: Automated maturity redemption
