# PiRC3 Section 8: Data Types Reference

## Enums

### EscrowState
Created, Funded, Delivered, Completed, Disputed, Resolved, Expired, Cancelled, MilestoneActive

### DisputeCategory
NonDelivery, NotAsDescribed, DamagedDefective, DeliveryDispute, ServiceNotProvided, UnauthorizedCharge, Other

### DisputeRuling
FullRefund, PartialRefund, SellerFavored, Split, Dismissed

### DisputePhase
Filed, Evidence, Voting, Ruling, Appealed, Final

### ReputationTier
Bronze, Silver, Gold, Platinum, Diamond

### VerificationLevel
None, Basic, Standard, Premium

### VerificationStatus
NotApplied, Pending, UnderReview, InfoRequested, Approved, Suspended, Revoked, Expired

### MerchantCategory
DigitalGoods, PhysicalGoods, Services, FoodAndBeverage, Entertainment, Education, HealthAndWellness, ProfessionalServices, Retail, Other

### LoyaltyTier
Starter, Regular, Trusted, Elite, Legendary

### RewardType
FeeWaiver, JurorPriority, MerchantSpotlight, ReputationBoost, GovernanceVote

### SoulboundBadge (v1.1)
FirstTrade, TrustedBuyer, TrustedSeller, VerifiedMerchant, JurorVeteran, CommunityGuardian, EarlyAdopter, PlatinumTrader, DiamondElite, LoyaltyChampion

### AttestationType (v1.1)
IdentityVouch, CommerceVouch, SkillVouch, CommunityVouch

### MilestoneState (v1.1)
Pending, Submitted, Confirmed, Disputed, Released, Expired

### GroupEscrowState (v1.1)
Collecting, FullyFunded, Delivered, Completed, Disputed, Resolved, Cancelled, Expired

### JurorSpecialty (v1.1)
General, Commerce, DigitalGoods, Services, Subscription

## Structs

### EscrowAccount
escrow_id, buyer, seller, amount, token, state, created_at, delivery_deadline, confirmation_deadline, auto_release_timeout, subscription_id, order_metadata, is_milestone, milestones, current_milestone, released_amount

### ReputationProfile
pioneer, score, tier, total_escrows, completed_escrows, expired_escrows, disputes_as_buyer, disputes_as_seller, rulings_in_favor, rulings_against, is_verified_merchant, created_at, last_active, history_root, score_nonce, badge_count, attestation_score, sybil_score, unique_counterparties

### DisputeCase
dispute_id, escrow_id, filer, respondent, category, phase, jurors, commit_votes, filer_evidence, respondent_evidence, filed_at, evidence_deadline, voting_deadline, reveal_deadline, ruling, is_appealed, appeal_fee, juror_count

### Milestone (v1.1)
milestone_id, description_hash, amount, state, deadline, submitted_at, confirmed_at

### GroupParticipant (v1.1)
buyer, amount, funded, funded_at, refund_percentage

### BadgeOwnership (v1.1)
pioneer, badge, awarded_at, award_reason, revoked

### Attestation (v1.1)
attestation_id, attester, attested, attestation_type, attester_reputation, weight, created_at, expires_at, active

### SybilProfile (v1.1)
pioneer, unique_counterparties, total_transactions, reciprocal_ratio, avg_tx_interval, cluster_flag, last_analysis, sybil_score

### JurorVettingProfile (v1.1)
juror, reputation_score, cases_served, cases_consensus, consensus_rate, specialty, active, stake, last_served, penalty_points

### MerchantProfile
merchant, level, business_name_hash, category, status, jurisdiction, total_volume, total_orders, avg_rating, verified_at, expires_at, location_count, metadata_uri

### LoyaltyProfile
pioneer, points, tier, lifetime_points, redeemable_points, last_activity, referral_code, referral_count, activity_streak

### ModuleAddresses
escrow, reputation, dispute, merchant_verification, loyalty
