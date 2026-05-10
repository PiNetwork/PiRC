# PiRC3 Section 10: PiRC2 Integration Guide

## Overview

PiDCTP integrates with the PiRC2 Subscription Contract API to enable recurring commerce with escrow protection.

## Integration Points

### Subscription → Escrow
When a subscription charge occurs, PiDCTP can automatically create an escrow for the payment period, protecting both the subscriber and the service provider.

### Subscription → Reputation
Subscription payment history contributes to reputation scores, providing verifiable transaction history for recurring commerce.

### Subscription → Dispute
Subscription-related disputes (unauthorized charges, service not provided) are routed through the Dispute module with the `Subscription` juror specialty.

## Data Flow

```
PiRC2 Subscription Charge
    → PiDCTP Escrow (auto-create with subscription_id)
    → PiDCTP Reputation (record completion)
    → PiDCTP Loyalty (earn points)
```

## Contract Interface

The `subscription_id` field in `EscrowAccount` links escrow transactions to their originating PiRC2 subscriptions, enabling:
- Automatic escrow creation on subscription renewal
- Bulk dispute resolution for subscription-related issues
- Subscription-specific reputation tracking
