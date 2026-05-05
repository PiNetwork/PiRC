# Merchant Integration Guide: PiRC-101 Protocol

This guide provides the technical specifications for merchants to integrate the **$2,248,000 USD** internal purchasing power standard into their POS (Point of Sale) systems.

## 1. Valuation Mechanism
Merchants list products in **USD**. The PiRC-101 Justice Engine provides a real-time bridge where:
`1 Mined Pi = [Market Price] * 10,000,000 USD`

## 2. API Implementation
Use the `JusticeEngineOracle` to fetch the current internal purchasing power.
- **Input:** 1 Pi
- **Output:** Current $REF$ (Sovereign USD-equivalent Credit)

## 3. Transaction Example
- **Item Price:** $2,248.00 USD
- **Pioneer Pays:** 0.001 Mined Pi
- **Merchant Receives:** 2,248 $REF$ units (Fully backed by Pi collateral in the Core Vault).

## 4. Merchant Benefits
- **Zero Volatility:** Protection against external market crashes.
- **Instant Settlement:** No waiting for external exchange liquidations.

