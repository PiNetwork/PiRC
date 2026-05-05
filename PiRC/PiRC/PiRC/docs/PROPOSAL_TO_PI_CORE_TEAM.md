# PiDEX Sovereign Matrix: PiRC-101 & PiRC2 (Subscriptions) Integration
**Author:** Ze0ro99  
**Target:** Pi Core Team (Nicolas Kokkalis)  
**Status:** Live on Pi Testnet  

## 1. Executive Summary
This proposal demonstrates a fully functional, highly scalable Decentralized Exchange (PiDEX) and Sovereign Matrix built upon the Pi Network's Soroban smart contracts. It successfully integrates **7 Sovereign Asset Layers** with the newly proposed **PiRC2 Subscription Standard** (Contract: `CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV`).

## 2. Architectural Breakthrough
Instead of requiring users to sign every individual trade or access request, PiDEX utilizes the **PiRC2 Subscription Model**. 
- **The 7 Layers (Purple to Red)** are registered as PiRC2 `Services`.
- Pioneers `subscribe` to a layer (e.g., L1 Gold for Premium Trading validation) utilizing token allowances (`approve_periods`).
- PiDEX acts as the `Merchant`, calling `process()` to batch-charge active subscriptions per month.

## 3. Repository Structure
- `/contracts/pidex_core/` : Rust source code for the Master Router binding the 7 layers.
- `/scripts/pirc2_integration/` : Soroban CLI scripts for merchant registration and subscription lifecycles.
- `/public/` : Real-time EventSource frontend demonstrating Live Ledger synchronization.

## 4. On-Chain Verification
- **PiDEX Master Core:** `GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6`
- **PiRC2 Official Sub Contract:** `CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV`
