# PiRC2 & PiRC-45: Integrated Economic & Technical Framework

## 1. Mathematical Specification (WCF)
The Working Capital Factor (WCF) is calculated as:
$$WCF_{t} = (WCF_{t-1} \cdot e^{-\lambda \Delta t}) + \alpha \sum \ln(V_i + 1)$$

## 2. Technical Scope
- **PiRC-45:** Standardizes Metadata Schema to resolve Issue #16.
- **PiRC2:** Introduces the "Justice Engine" on Soroban Smart Contracts.

## 3. Threat Model & Mitigations
- **Sybil Attacks:** Mitigated via PoV (Proof of Value) using PiRC-45 metadata.
- **State Bloat:** Mitigated via Lazy State Initialization.

