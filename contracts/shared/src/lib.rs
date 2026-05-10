#![no_std]
use soroban_sdk::{contracttype, Address, BytesN, Env, Symbol, Vec, Map};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowState { Created, Funded, Delivered, Completed, Disputed, Resolved, Expired, Cancelled, MilestoneActive }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeCategory { NonDelivery, NotAsDescribed, DamagedDefective, DeliveryDispute, ServiceNotProvided, UnauthorizedCharge, Other }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeRuling { FullRefund, PartialRefund, SellerFavored, Split, Dismissed }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputePhase { Filed, Evidence, Voting, Ruling, Appealed, Final }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ReputationTier { Bronze, Silver, Gold, Platinum, Diamond }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationLevel { None, Basic, Standard, Premium }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationStatus { NotApplied, Pending, UnderReview, InfoRequested, Approved, Suspended, Revoked, Expired }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MerchantCategory { DigitalGoods, PhysicalGoods, Services, FoodAndBeverage, Entertainment, Education, HealthAndWellness, ProfessionalServices, Retail, Other }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoyaltyTier { Starter, Regular, Trusted, Elite, Legendary }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RewardType { FeeWaiver, JurorPriority, MerchantSpotlight, ReputationBoost, GovernanceVote }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum SoulboundBadge { FirstTrade, TrustedBuyer, TrustedSeller, VerifiedMerchant, JurorVeteran, CommunityGuardian, EarlyAdopter, PlatinumTrader, DiamondElite, LoyaltyChampion }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AttestationType { IdentityVouch, CommerceVouch, SkillVouch, CommunityVouch }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneState { Pending, Submitted, Confirmed, Disputed, Released, Expired }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GroupEscrowState { Collecting, FullyFunded, Delivered, Completed, Disputed, Resolved, Cancelled, Expired }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum JurorSpecialty { General, Commerce, DigitalGoods, Services, Subscription }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowAccount {
    pub escrow_id: u64, pub buyer: Address, pub seller: Address, pub amount: i128,
    pub token: Address, pub state: EscrowState, pub created_at: u64,
    pub delivery_deadline: u64, pub confirmation_deadline: u64,
    pub auto_release_timeout: u64, pub subscription_id: Option<u64>,
    pub order_metadata: BytesN<32>, pub is_milestone: bool,
    pub milestones: Vec<Milestone>, pub current_milestone: u32, pub released_amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationProfile {
    pub pioneer: Address, pub score: u32, pub tier: ReputationTier,
    pub total_escrows: u32, pub completed_escrows: u32, pub expired_escrows: u32,
    pub disputes_as_buyer: u32, pub disputes_as_seller: u32,
    pub rulings_in_favor: u32, pub rulings_against: u32,
    pub is_verified_merchant: bool, pub created_at: u64, pub last_active: u64,
    pub history_root: BytesN<32>, pub score_nonce: u32,
    pub badge_count: u32, pub attestation_score: u32, pub sybil_score: u32, pub unique_counterparties: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub milestone_id: u32, pub description_hash: BytesN<32>, pub amount: i128,
    pub state: MilestoneState, pub deadline: u64, pub submitted_at: Option<u64>, pub confirmed_at: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GroupParticipant { pub buyer: Address, pub amount: i128, pub funded: bool, pub funded_at: Option<u64>, pub refund_percentage: u32 }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GroupEscrow { pub escrow_id: u64, pub organizer: Address, pub seller: Address, pub token: Address, pub total_amount: i128, pub funded_amount: i128, pub state: GroupEscrowState, pub participants: Vec<GroupParticipant>, pub created_at: u64, pub funding_deadline: u64, pub delivery_deadline: u64, pub auto_release_timeout: u64, pub order_metadata: BytesN<32> }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeOwnership { pub pioneer: Address, pub badge: SoulboundBadge, pub awarded_at: u64, pub award_reason: BytesN<32>, pub revoked: bool }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attestation { pub attestation_id: u64, pub attester: Address, pub attested: Address, pub attestation_type: AttestationType, pub attester_reputation: u32, pub weight: u32, pub created_at: u64, pub expires_at: u64, pub active: bool }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SybilProfile { pub pioneer: Address, pub unique_counterparties: u32, pub total_transactions: u32, pub reciprocal_ratio: u32, pub avg_tx_interval: u64, pub cluster_flag: bool, pub last_analysis: u64, pub sybil_score: u32 }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct JurorVettingProfile { pub juror: Address, pub reputation_score: u32, pub cases_served: u32, pub cases_consensus: u32, pub consensus_rate: u32, pub specialty: JurorSpecialty, pub active: bool, pub stake: i128, pub last_served: u64, pub penalty_points: u32 }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MerchantProfile { pub merchant: Address, pub level: VerificationLevel, pub business_name_hash: BytesN<32>, pub category: MerchantCategory, pub status: VerificationStatus, pub jurisdiction: BytesN<2>, pub total_volume: i128, pub total_orders: u32, pub avg_rating: u32, pub verified_at: Option<u64>, pub expires_at: Option<u64>, pub location_count: u32, pub metadata_uri: BytesN<32> }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoyaltyProfile { pub pioneer: Address, pub points: u32, pub tier: LoyaltyTier, pub lifetime_points: u32, pub redeemable_points: u32, pub last_activity: u64, pub referral_code: BytesN<32>, pub referral_count: u32, pub activity_streak: u32 }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ModuleAddresses { pub escrow: Address, pub reputation: Address, pub dispute: Address, pub merchant_verification: Address, pub loyalty: Address }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct JurorVote { pub juror: Address, pub vote: DisputeRuling, pub confidence: u8, pub voted_at: u64, pub justification_hash: BytesN<32> }

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DisputeCase { pub dispute_id: u64, pub escrow_id: u64, pub filer: Address, pub respondent: Address, pub category: DisputeCategory, pub phase: DisputePhase, pub jurors: Vec<Address>, pub votes: Vec<JurorVote>, pub filer_evidence: Vec<BytesN<32>>, pub respondent_evidence: Vec<BytesN<32>>, pub filed_at: u64, pub evidence_deadline: u64, pub voting_deadline: u64, pub ruling: Option<DisputeRuling>, pub is_appealed: bool, pub appeal_fee: i128 }
