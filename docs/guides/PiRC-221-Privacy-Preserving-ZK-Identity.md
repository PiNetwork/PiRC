# PiRC-221: Privacy-Preserving ZK-Identity

## 1. Overview
Enables users to prove identity attributes (e.g., age, nationality) without revealing raw data, using Zero-Knowledge Proofs (ZKP) linked to PiRC-209.

## 2. Technical Specification
- **Proof Verification**: Off-chain generation, on-chain validation.
- **Privacy**: No PII (Personally Identifiable Information) is stored on the ledger.
---

## 3. Reference Smart Contracts
**Solidity**: `contracts/PiRC221ZKIdentity.sol`  
**Soroban**: `contracts/soroban/src/zk_identity.rs`

**Status**: Ready.
