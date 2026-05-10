# PiRC3 Section 5: Dispute Resolution Protocol

## Overview

Decentralized arbitration system for resolving commerce disputes between Pioneers.

## Dispute Categories

| Category | Description |
|----------|-------------|
| NonDelivery | Seller didn't deliver |
| NotAsDescribed | Item doesn't match description |
| DamagedDefective | Item arrived damaged |
| DeliveryDispute | Delivery timing or method issue |
| ServiceNotProvided | Service wasn't performed |
| UnauthorizedCharge | Unauthorized deduction |
| Other | Miscellaneous |

## Dispute Phases

```
Filed → Evidence → Voting → Ruling → Final
                                    ↘ Appealed → Final
```

## Timelines

| Phase | Duration |
|-------|----------|
| Evidence submission | 72 hours |
| Commit voting | 48 hours |
| Reveal votes | 24 hours |
| Appeal window | 24 hours |

## Commit-Reveal Voting

Jurors vote in two phases to prevent vote copying:
1. **Commit**: Juror submits hash(vote + salt)
2. **Reveal**: After voting deadline, juror reveals vote and salt
3. **Verification**: Contract verifies hash matches commitment

## v1.1: Juror Vetting

Jurors must meet minimum requirements:
- Minimum Silver reputation (200+ score)
- Minimum 10 Pi stake as juror bond
- Specialty declaration: General, Commerce, DigitalGoods, Services, Subscription

Specialty matching ensures relevant expertise for each dispute category.

## v1.1: Reputation-Weighted Voting

Instead of 1-juror-1-vote, votes are weighted by reputation:

| Tier | Base Weight | Consensus Bonus |
|------|-------------|-----------------|
| Bronze | 1 | +1 if >80% consensus & 3+ cases |
| Silver | 2 | +1 if >80% consensus & 3+ cases |
| Gold | 3 | +1 if >80% consensus & 3+ cases |
| Platinum | 4 | +1 if >80% consensus & 3+ cases |
| Diamond | 5 | +1 if >80% consensus & 3+ cases |

## Ruling Types

| Ruling | Buyer Refund |
|--------|-------------|
| FullRefund | 100% |
| PartialRefund | 50% |
| SellerFavored | 0% |
| Split | 50% |
| Dismissed | 0% |

## Anti-Collusion Measures

- Hidden juror identities until after ruling
- Commit-reveal prevents vote copying
- Juror bond (10 Pi) slashable for non-participation
- Penalty points for non-reveal (4+ = ineligible)

## Contract Interface

```rust
fn open_dispute(env, caller, escrow_id, filer, respondent, category, initial_evidence, jurors) -> u64
fn submit_evidence(env, party, dispute_id, evidence_hash)
fn start_voting(env, caller, dispute_id)
fn commit_vote(env, juror, dispute_id, commitment)
fn reveal_vote(env, juror, dispute_id, vote, salt)
fn execute_ruling(env, caller, dispute_id) -> (DisputeRuling, u32)
// v1.1
fn register_juror(env, juror, specialty, reputation_score, stake)
fn deactivate_juror(env, juror)
fn get_juror_profile(env, juror) -> JurorVettingProfile
fn is_juror_eligible(env, juror, category) -> bool
fn execute_weighted_ruling(env, caller, dispute_id) -> (DisputeRuling, u32, u32)
```
