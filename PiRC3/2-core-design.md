# PiRC3 Section 2: Core Design & Architecture

## 5-Module Architecture

```
                    ┌───────────────────┐
                    │   Coordinator     │  ← Entry point & router
                    └─────────┬─────────┘
                              │
        ┌─────────┬──────────┼──────────┬─────────┐
        ▼         ▼          ▼          ▼         ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
   │ Escrow  ││Reputation││ Dispute ││Merchant ││ Loyalty │
   │ Module  ││  Engine  ││Protocol ││  Verify ││ Rewards │
   └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘
```

## Module Interactions

### Transaction Flow (Happy Path)
1. Buyer creates escrow via Coordinator
2. Buyer funds escrow with Pi tokens
3. Seller confirms delivery
4. Buyer confirms receipt → funds released to seller
5. Reputation scores updated for both parties
6. Loyalty points earned by both parties

### Dispute Flow
1. Either party opens dispute via Coordinator
2. Escrow funds frozen
3. Evidence submitted by both parties
4. Jurors selected and vote (commit-reveal)
5. Ruling executed → funds distributed per ruling
6. Reputation scores updated based on ruling

## Coordinator Contract

The Coordinator is the single entry point for all PiDCTP interactions. It:
- Routes calls to the appropriate module
- Enforces cross-module invariants
- Manages protocol-level configuration
- Handles emergency pause

## Fee Structure

| Fee Type | Amount | Recipient |
|----------|--------|-----------|
| Escrow fee | 1% of transaction | Treasury |
| Dispute filing fee | 1 Pi | Juror pool |
| Appeal fee | 2 Pi | Juror pool |
| Merchant verification | 2-10 Pi | Treasury |

## Upgrade Strategy

- Each module is independently upgradeable
- 48-hour timelock on all contract upgrades
- 3-of-5 admin multi-sig required for upgrades
- Emergency pause available for critical vulnerabilities
