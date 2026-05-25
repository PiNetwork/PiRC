# PROPOSAL_203: Merchant Oracle Pricing Plugin

## Vision

Real-time USD/PI oracle for merchants using the median of Kraken, KuCoin, and Binance references.

## Pinework 7 Layers

- Infrastructure: Exchange price feeds
- Protocol: Median aggregation
- Smart Contract: Oracle finalization
- Service: Merchant quote endpoint
- Interoperability: Checkout callback pricing
- Application: Merchant dashboard
- Governance: Risk parameter review

## Invariant (KaTeX)

\[
P_{\text{final}} = \operatorname{median}(P_K, P_{Ku}, P_B) \times (1 + \Phi), \quad \Phi < 1
\]

## Security and Threat Model

- Outlier-resistant median aggregation
- Fail-open protection through source count checks
- Max spread guard between exchange inputs

## Implementation

Reference files:
- `contracts/oracle_median.rs`
- `economics/merchant_pricing_sim.py`
