# PiRC3 Section 3: Escrow Payment System

## Overview

The Escrow module provides trustless payment protection for commerce transactions between Pioneers.

## Escrow Lifecycle

```
Created → Funded → Delivered → Completed
                  ↘ Disputed → Resolved
   ↘ Cancelled         ↘ Expired
```

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Fee | 1% (100 bps) | Deducted from seller payout |
| Min auto-release timeout | 24 hours | Buyer must confirm within this window |
| Max fee | 10% | Protocol-enforced ceiling |

## Escrow States

| State | Description |
|-------|-------------|
| Created | Escrow created, awaiting buyer funding |
| Funded | Buyer deposited payment |
| Delivered | Seller confirmed delivery |
| Completed | Buyer confirmed receipt, funds released |
| Disputed | Dispute opened, funds frozen |
| Resolved | Dispute ruling executed |
| Expired | Seller failed to deliver by deadline |
| Cancelled | Cancelled by buyer or mutual agreement |
| MilestoneActive | v1.1: Milestone escrow in progress |

## v1.1: Milestone Escrow

Multi-stage fund release for large or complex orders:
- Each milestone has its own amount, deadline, and independent confirmation
- If a milestone fails, remaining funds are refunded to buyer
- Minimum 2 milestones required

## v1.1: Group Escrow

Multi-party escrow for group purchases:
- Multiple buyers pool funds for a single purchase
- Each participant has proportional refund share
- All participants must fund before escrow becomes active

## Contract Interface

```rust
fn create_escrow(env, buyer, seller, amount, token, delivery_deadline, auto_release_timeout, order_metadata) -> u64
fn fund_escrow(env, buyer, escrow_id)
fn confirm_delivery(env, seller, escrow_id)
fn confirm_receipt(env, buyer, escrow_id)
fn auto_release(env, caller, escrow_id)
fn cancel_escrow(env, caller, escrow_id)
fn expire_escrow(env, caller, escrow_id)
fn freeze_for_dispute(env, caller, escrow_id)
fn execute_ruling(env, caller, escrow_id, buyer_percentage)
// v1.1
fn create_milestone_escrow(env, buyer, seller, total_amount, token, milestone_amounts, milestone_deadlines, milestone_descriptions, auto_release_timeout, order_metadata) -> u64
fn submit_milestone(env, seller, escrow_id, milestone_id)
fn confirm_milestone(env, buyer, escrow_id, milestone_id)
fn create_group_escrow(env, organizer, seller, token, total_amount, participants, funding_deadline, delivery_deadline, auto_release_timeout, order_metadata) -> u64
fn fund_group_escrow(env, buyer, escrow_id)
```

## Security Considerations

- Checks-Effects-Interactions pattern enforced
- Funds held in contract address, not admin-controlled
- Only four release paths: confirm_receipt, auto_release, execute_ruling, cancel_escrow
- No admin override for escrow state
