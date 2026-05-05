# PiRC-101 Sovereign Monetary Standard

## Overview
PiRC-101 is a proposed decentralized monetary standard designed specifically for the Pi Network ecosystem. It enables a non-inflationary 10,000,000:1 internal credit expansion, allowing Pi to serve as the high-quality backing asset for a stable internal sovereign credit ($REF$). The protocol separates Pi's external volatility from its internal utility, protected by a dynamic, quadratic liquidity guardrail ($\Phi$).

## Architectural Overview: The Walled Garden
The core thesis is to create a "Walled Garden" economy. Merchants operating within this garden have pricing stability while safely leveraging Pi’s external value.

### Overhaul based on Core Team Technical Review
This repository has been overhaul in response to PR #45 technical review to include advanced stabilization logic:

- **Dynamic WCF Engine:** Contribution weights ($W_e$) now dynamically adjust based on Blended Utility Scores (log(TVL) + Velocity).
- **Hybrid Provenance Decay:** Invariant $\Psi$ is enforced via a hybrid decay model, preserving Pioneer advantage while preventing manipulative arbitrage after transfer.
- **Anti-Manipulation Layer:** Rewards ($REF$ velocity generated) are distributed based on Blended reputation scores and clustered wash-trading detection (Proof-of-Utility).

## ⚙️ Execution Environment & Architectural Note
**Important:** Pi Network’s blockchain consensus is derived from Stellar Core and does not natively execute Ethereum Virtual Machine (EVM) bytecode.

The Solidity contract in this repository (`PiRC101Vault.sol`) serves strictly as a **Turing-complete Economic Reference Model**. It formally defines the deterministic state transitions and mathematical invariants of the protocol’s "Justice Engine." Deployment requires either an EVM sidechain L2 or porting to Soroban (Rust).

## License
MIT
