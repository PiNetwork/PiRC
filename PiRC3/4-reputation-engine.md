# PiRC3 Section 4: Reputation Engine

## Overview

The Reputation Engine provides verifiable, portable trust scores based on on-chain transaction history.

## Score System

| Tier | Score Range | Starting Score |
|------|-------------|---------------|
| Bronze | 50-199 | — |
| Silver | 200-449 | 200 (new profiles) |
| Gold | 450-699 | — |
| Platinum | 700-899 | — |
| Diamond | 900-1000 | — |

## Score Changes

| Event | Buyer | Seller |
|-------|-------|--------|
| Escrow completed | +3 | +5 |
| Escrow expired | — | -15 |
| Dispute ruling in favor | +10 | +10 |
| Dispute ruling against | -20 | -20 |
| Merchant verification | — | +50 |
| Badge awarded (v1.1) | +2 | +2 |

## v1.1: Soulbound Badges

Non-transferable credential tokens representing specific achievements:

| Badge | Criteria |
|-------|----------|
| FirstTrade | Completed first escrow |
| TrustedBuyer | 10+ completed purchases |
| TrustedSeller | 10+ completed sales |
| VerifiedMerchant | Passed KYB verification |
| JurorVeteran | Served on 5+ dispute panels |
| CommunityGuardian | 20+ rulings with consensus |
| EarlyAdopter | Active in first 90 days |
| PlatinumTrader | 100+ completed escrows |
| DiamondElite | Reached Diamond tier |
| LoyaltyChampion | Reached Legendary loyalty |

## v1.1: Sybil Resistance

On-chain transaction pattern analysis to detect fake accounts:
- Tracks unique counterparties per Pioneer
- Flags accounts with <30% unique counterparty ratio
- Sybil score: 0 (human) to 10000 (definite Sybil)
- High Sybil score reduces effective reputation score

## v1.1: Reputation Attestations

Third-party vouching system:
- Verified Pioneers can attest to another's trustworthiness
- Weight derived from attester's tier (Bronze=1 to Diamond=5)
- Attestations expire after 180 days
- Minimum Silver tier required to attest

## v1.1: ZK Verification Roadmap

Future: prove reputation tier without revealing exact score using ZK-SNARKs.

## Decay Mechanism

- 1% score decay per week of inactivity (after 30 days)
- Minimum score: 50 (cannot decay below)
- Any transaction activity resets the decay timer

## Contract Interface

```rust
fn create_profile(env, pioneer) -> ReputationProfile
fn record_escrow_completion(env, caller, pioneer, as_seller) -> u32
fn record_escrow_expiry(env, caller, seller) -> u32
fn record_dispute_ruling(env, caller, pioneer, ruling_in_favor, as_seller) -> u32
fn set_merchant_status(env, caller, pioneer, is_verified)
fn apply_decay(env, pioneer) -> u32
fn get_profile(env, pioneer) -> ReputationProfile
fn get_score(env, pioneer) -> u32
fn get_tier(env, pioneer) -> ReputationTier
fn verify_threshold(env, pioneer, minimum_score) -> bool
// v1.1
fn award_badge(env, caller, pioneer, badge, reason)
fn revoke_badge(env, caller, pioneer, badge)
fn has_badge(env, pioneer, badge) -> bool
fn create_attestation(env, attester, attested, attestation_type) -> u64
fn revoke_attestation(env, caller, attestation_id)
fn update_sybil_profile(env, caller, pioneer, new_counterparty)
fn get_sybil_profile(env, pioneer) -> SybilProfile
fn get_effective_score(env, pioneer) -> u32
fn verify_tier_claim(env, pioneer, claimed_tier) -> bool
```
