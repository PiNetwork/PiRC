# Luxamir x PiRC Integration Guide

## Standardized Flow
1. **Interaction (Luxamir AR):** User interacts with the product.
2. **Entry Point (Luxamir Verify):** Product is scanned.
3. **Logic (PiRC SDK):** `handleLuxamirScan()` is called.
4. **Blockchain (Soroban):** A sovereign contract is deployed/updated.
5. **Output (Luxamir Certs):** A cryptographic certificate is returned to the UI.

## Integration Point
Call `handleLuxamirScan(data)` within the Verify module to trigger the full PiRC2 liquidity flow.
