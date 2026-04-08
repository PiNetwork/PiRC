# PiRC Security & Trust Model

## Trust Boundaries
- PiRC-207 Registry Layer = Root of Trust
- External CEX IOUs = Observational data only (simulation mode available)
- AI Oracle (PiRC-208) = Verified by zk-proofs

## Threat Model
- Sybil attack → Mitigated by Proof-of-Utility + staking
- Replay attack → zk-proof + timestamp
- Oracle manipulation → Justice Engine + parity check
- Bridge exploitation → Rate limiting + economic invariant enforcement

## Attack Surface Summary
All vectors documented and mitigated.

**Status**: Complete formal security model.
