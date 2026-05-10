# PiRC3 Section 7: Loyalty & Rewards

## Overview

Ecosystem incentives rewarding consistent honest commerce behavior.

## Loyalty Tiers

| Tier | Points Required |
|------|----------------|
| Starter | 0 |
| Regular | 100 |
| Trusted | 500 |
| Elite | 2000 |
| Legendary | 10000 |

## Points Earning

| Action | Points |
|--------|--------|
| Complete escrow (buyer) | 10 |
| Complete escrow (seller) | 15 |
| Serve as juror | 20 |
| Consensus vote | 5 bonus |
| Referral (active Pioneer) | 50 |
| Activity streak (7 days) | 25 |

## Reward Types

| Reward | Description |
|--------|-------------|
| FeeWaiver | Reduced escrow fees |
| JurorPriority | Priority juror selection |
| MerchantSpotlight | Featured merchant listing |
| ReputationBoost | Temporary score boost |
| GovernanceVote | Protocol governance voting |

## Contract Interface

```rust
fn create_profile(env, pioneer) -> LoyaltyProfile
fn earn_points(env, caller, pioneer, action, amount)
fn redeem_reward(env, pioneer, reward_type, amount)
fn update_streak(env, pioneer)
fn get_profile(env, pioneer) -> LoyaltyProfile
```
