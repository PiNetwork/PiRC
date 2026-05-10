# PiRC3 Section 6: Merchant Verification

## Overview

Lightweight Know-Your-Business (KYB) process establishing merchant legitimacy within the Pi ecosystem.

## Verification Levels

| Level | Requirements | Benefits |
|-------|-------------|----------|
| Basic | Business name, category, jurisdiction | Basic listing |
| Standard | + Location, volume proof | Enhanced visibility |
| Premium | + Full documentation, audit | Featured placement |

## Verification Status

| Status | Description |
|--------|-------------|
| NotApplied | Default state |
| Pending | Application submitted |
| UnderReview | Being evaluated |
| InfoRequested | Additional info needed |
| Approved | Verification granted |
| Suspended | Temporarily suspended |
| Revoked | Permanently removed |
| Expired | Annual renewal needed |

## Merchant Categories

DigitalGoods, PhysicalGoods, Services, FoodAndBeverage, Entertainment, Education, HealthAndWellness, ProfessionalServices, Retail, Other

## Contract Interface

```rust
fn apply_verification(env, merchant, business_name_hash, category, jurisdiction, metadata_uri) -> u64
fn approve_verification(env, caller, merchant, level)
fn suspend_merchant(env, caller, merchant, reason_hash)
fn revoke_verification(env, caller, merchant, reason_hash)
fn get_merchant(env, merchant) -> MerchantProfile
```
