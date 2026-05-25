# PiRC-101 Developer Integration Guide

## Overview
This guide provides the necessary guidelines for developers interacting with the **PiRC-101 Sovereign Vault Reference Model**.

## ⚙️ Architectural Note: EVM Reference Model
**Important:** Pi Network’s blockchain consensus does not natively execute Ethereum Virtual Machine (EVM) bytecode. The Solidity contract provided (`/contracts/PiRC101Vault.sol`) serves strictly as a **Turing-complete Economic Reference Model**.

Deployment requires either:
1.  **Porting to Soroban (Rust)** for native Stellar L1 deployment.
2.  Execution on an **EVM-compatible Layer 2** sidechain anchored to Pi.

## Contract Interface Guide (API Reference)
API definitions for the Justice Engine flow.

### `depositAndMint(uint256 _amount, uint8 _class)`
Allows verified users (linked to established identity ERS-1/KYC hub) to lock external Pi and mint dynamic amounts of REF credits, subject to the Reflexive ${\Phi}$ Guardrail.

### `conceptualizeWithdrawal(uint256 _refAmount, uint8 _class)`
Burns internal REF credits and conceptually liquidates conceptual USD value from external reserves, subject to dynamic daily exit caps and unit consistent unit comparisons.

## Oracle Integration Guidelines
Production deployment requires integrating a reliable Decentralized Oracle Aggregation Mechanism to feed the $\Phi$ guardrail calculation:
* **Pi Price Oracle:** Secure, manipulation-resistant USD value of Pi.
* **Liquidity Depth Oracle:** Validating AMM TVL against clustering.
