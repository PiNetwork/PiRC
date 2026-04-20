# PROPOSAL_202: Adaptive Utility Gating Plugin

## Vision

Dynamic utility gating rewards active pioneers (Design 2 style) with up to 3.14x higher access.

## Pinework 7 Layers

- Infrastructure: Oracle feeds
- Protocol: Engagement scoring
- Smart Contract: Gate logic
- Service: Utility unlock
- Interoperability: `Pi.createPayment` callback
- Application: Pioneer dashboard
- Governance: Community-voted thresholds

## Invariants (KaTeX)

\[
\text{GateOpen} = (\text{Score} \geq \text{Threshold}) \land (\Phi < 1)
\]

\[
\text{AllocationMultiplier} = 1 + \frac{\text{ActiveScore}}{314000000}
\]

Allocation multiplier is clamped at `3.14`.

## Security and Threat Model

- Sybil resistance via human-work oracle verification
- Circuit breaker when anomaly pressure exceeds 15%

## Implementation

Reference files:
- `contracts/adaptive_gate.rs`
- `economics/utility_simulator.py`
