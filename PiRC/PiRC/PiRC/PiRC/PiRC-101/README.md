# PiRC-101: Sovereign Monetary Standard Framework

This repository documents the PiRC-101 economic control framework and its reference implementation. It defines a reflexive monetary controller designed to stabilize the Pi Network ecosystem through algorithmic credit expansion and utility gating.

## 💎 Core Valuation & The Sovereign Multiplier

The economic design of PiRC-101 is anchored by the **QWF (Quantum Wealth Factor / Sovereign Multiplier)**. 

### QWF Governance & Safety Bounds
To prevent governance-driven overexpansion or economic instability, QWF adjustments are discrete (proposal-based) but strictly constrained by an algorithmic safety bound. Any proposed change must pass through a structural `clamp` function based on Network Velocity and Total Value Locked (TVL):

```text
QWF_new = clamp(
    QWF_current * (1 + adjustment_rate),
    MIN_QWF,
    MAX_QWF
)

Current Base Value: 10,000,000 (10^7)
​The IPPR Economic Layer
​The Internal Purchasing Power Reference (IPPR) is currently calculated at ~$2,248,000 USD per 1 mined Pi.
​Mechanics: The IPPR is not just a theoretical metric; it directly determines the exchange rate for minting the protocol's internal settlement asset: $REF (Reflexive Ecosystem Fiat).
​Settlement: Merchants do not settle in volatile external Pi. They price goods in USD, and contracts settle in $REF units, which are fully collateralized by the Mined Pi locked in the Core Vault.
​⚙️ Justice Engine Architecture & Stability
​The "Justice Engine" acts as the algorithmic core of the protocol. To prevent runaway credit expansion or liquidity shocks, the engine employs a strict reflexive stabilizing control loop


External Oracle Price Ingestion
│
▼
Credit Expansion Rate (IPPR Calculation)
│
▼
Network Velocity & Liquidity Monitor (L_n)
│
▼
Reflexive Guardrail (Φ Constraint)
│   ├── If Φ >= 1: Minting proceeds normally.
│   └── If Φ < 1: Expansion mathematically crushed.
▼
Adaptive Settlement & Issuance

Oracle Layer Resilience
​The Oracle Layer is the primary defense against external market manipulation. It operates on a Multi-Source DOAM (Decentralized Oracle Aggregation Model):
​Medianization: Feeds from at least 3 independent external data sources are medianized to prevent single-source poisoning.
​Desync Mitigation (Circuit Breaker): If the external price signal deviates by more than 15% within a single epoch (Heartbeat failure), the Oracle triggers a "Stale State," temporarily pausing new $REF minting until consensus is restored.
​🖥 Execution Layer: Soroban vs. Off-Chain
​Pi Network utilizes a Stellar-based consensus architecture (SCP). To clarify the intended deployment model, the PiRC-101 architecture is strictly divided into On-chain and Off-chain environments:
​On-chain (Soroban / Rust):
​Core Vault (Collateral custody of Mined Pi).
​IPPR Ledger ($REF token issuance and merchant settlement).
​WCF Utility Gating (Verifying Pioneer "Mined" status via Snapshots).
​Governance execution & clamp logic.
​Off-chain (Infrastructure):
​Oracle Aggregation nodes (feeding the medianized price to the Soroban contract).
​Economic Simulation engines (/simulator).
​Merchant & Pioneer Dashboard visualizations.
​🛠 Project Components
​/contracts: Reference implementations (Solidity models and upcoming Soroban logic).
​/simulator: Python & JS stress-testing tools proving protocol solvency.
​/security: Threat models (Sybil, Wash Trading, Oracle Manipulation).
​/docs: Formal technical standards (PI-STANDARD-101) and Integration guides.

```
