# PiRC Smart Contracts & DEX Integration (Docs)

This folder explains **smart contracts** with a strong focus on how they enforce **PiRC launchpad rules** and how they integrate with a **DEX/AMM**.

These docs are written to be understandable for someone new to smart contracts *and* precise enough to implement.

---

## What “PiRC-aligned smart contracts” means

PiRC requires these properties to be true **by construction** (i.e., enforced by code, not policy):

- **All committed Pi goes into liquidity**, not to the project team.
- **Initial liquidity cannot be withdrawn by the project** (escrow/LP lock).
- **Allocation and pricing rules are deterministic** and auditable.
- **State transitions are explicit** (participation → allocation → TGE → post-launch).

---

## Table of contents

- [`01-smart-contract-basics.md`](01-smart-contract-basics.md)
- [`02-pirc-invariants.md`](02-pirc-invariants.md)
- [`03-contract-architecture.md`](03-contract-architecture.md)
- [`04-launch-state-machine.md`](04-launch-state-machine.md)
- [`05-commitments-allocation-math.md`](05-commitments-allocation-math.md)
- [`06-liquidity-amm-formulas.md`](06-liquidity-amm-formulas.md)
- [`07-dex-integration.md`](07-dex-integration.md)
- [`08-security-threat-model.md`](08-security-threat-model.md)
- [`09-migration-from-current-backend.md`](09-migration-from-current-backend.md)
- [`10-reference-contract-skeletons.md`](10-reference-contract-skeletons.md)
- [`11-end-to-end-worked-example.md`](11-end-to-end-worked-example.md)
- [`glossary.md`](glossary.md)
- [`faq.md`](faq.md)

---

## How to read these docs

- If you’re new: start at **01 → 02 → 03 → 04**.
- If you care about the math: focus on **05 + 06** (they include formulas and worked examples).
- If you care about the DEX side: read **06 + 07**.
- If you’re implementing: read **03 + 04 + 08 + 10**, then **09** to map to this repo’s current architecture.

---

 

Done by (https://github.com/Pi-Defi-world) team at Zyradex and Provenalabs