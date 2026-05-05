# Paid Subscriptions Smart Contract (PiRC-2)

This directory contains the official Soroban Rust implementation for the Pi Network PiRC-2 Paid Subscriptions Standard.

## Features
- **Zero Charge Drift:** Strict mathematical tracking of `next_charge_ts`.
- **Batch Processing:** Paginated arrays for handling millions of subscribers efficiently.
- **Allowance Mechanism:** Secure, non-custodial recurring token transfers using Stellar's `approve` logic.
- **Graceful Fault Tolerance:** Individual failing subscriptions do not revert the master processing batch.

**Author / Architect:** Ze0ro99
**Target:** `PiNetwork/SmartContracts`
