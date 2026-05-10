#![no_std]
use soroban_sdk::{contract, contractimpl, Symbol, Address, BytesN, Env, Vec};
use shared::{ReputationTier, SoulboundBadge, AttestationType, BadgeOwnership, Attestation, SybilProfile, ReputationProfile};

#[cfg(test)]
mod test;

const ATTEST_CTR: Symbol = Symbol::new(&[], "att_ctr");
fn rep_key(_env: &Env, _addr: &Address) -> Symbol { Symbol::new(&[], "rep") }
fn badge_key(_env: &Env, _addr: &Address, badge: &SoulboundBadge) -> Symbol {
    let disc = match badge {
        SoulboundBadge::FirstTrade => 0u32, SoulboundBadge::TrustedBuyer => 1,
        SoulboundBadge::TrustedSeller => 2, SoulboundBadge::VerifiedMerchant => 3,
        SoulboundBadge::JurorVeteran => 4, SoulboundBadge::CommunityGuardian => 5,
        SoulboundBadge::EarlyAdopter => 6, SoulboundBadge::PlatinumTrader => 7,
        SoulboundBadge::DiamondElite => 8, SoulboundBadge::LoyaltyChampion => 9,
    };
    Symbol::new(&[], &format!("bdg_{}", disc).as_str())
}
fn attest_key(_env: &Env, id: u64) -> Symbol { Symbol::new(&[], &format!("att_{}", id).as_str()) }
fn sybil_key(_env: &Env, _addr: &Address) -> Symbol { Symbol::new(&[], "sybil") }

fn score_to_tier(score: u32) -> ReputationTier {
    if score >= 900 { ReputationTier::Diamond } else if score >= 700 { ReputationTier::Platinum }
    else if score >= 450 { ReputationTier::Gold } else if score >= 200 { ReputationTier::Silver }
    else { ReputationTier::Bronze }
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    pub fn create_profile(env: Env, pioneer: Address) -> ReputationProfile {
        pioneer.require_auth();
        let p = ReputationProfile {
            pioneer: pioneer.clone(), score: 200, tier: ReputationTier::Silver,
            total_escrows: 0, completed_escrows: 0, expired_escrows: 0,
            disputes_as_buyer: 0, disputes_as_seller: 0, rulings_in_favor: 0, rulings_against: 0,
            is_verified_merchant: false, created_at: env.ledger().timestamp(),
            last_active: env.ledger().timestamp(), history_root: BytesN::from_array(&env, &[0;32]),
            score_nonce: 0, badge_count: 0, attestation_score: 0, sybil_score: 0, unique_counterparties: 0,
        };
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p);
        p
    }

    pub fn record_escrow_completion(env: Env, _caller: Address, pioneer: Address, as_seller: bool) -> u32 {
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap();
        p.total_escrows += 1; p.completed_escrows += 1;
        let bonus: u32 = if as_seller { 5 } else { 3 };
        p.score = (p.score + bonus).min(1000); p.tier = score_to_tier(p.score);
        p.last_active = env.ledger().timestamp(); p.score_nonce += 1;
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p);
        p.score
    }

    pub fn record_escrow_expiry(env: Env, _caller: Address, seller: Address) -> u32 {
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &seller)).unwrap();
        p.total_escrows += 1; p.expired_escrows += 1;
        p.score = p.score.saturating_sub(15); p.tier = score_to_tier(p.score);
        p.last_active = env.ledger().timestamp();
        env.storage().persistent().set(&rep_key(&env, &seller), &p); p.score
    }

    pub fn record_dispute_ruling(env: Env, _caller: Address, pioneer: Address, ruling_in_favor: bool, _as_seller: bool) -> u32 {
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap();
        if ruling_in_favor { p.rulings_in_favor += 1; p.score = (p.score + 10).min(1000); }
        else { p.rulings_against += 1; p.score = p.score.saturating_sub(20); }
        p.tier = score_to_tier(p.score); p.last_active = env.ledger().timestamp();
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p); p.score
    }

    pub fn set_merchant_status(env: Env, _caller: Address, pioneer: Address, is_verified: bool) {
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap();
        p.is_verified_merchant = is_verified;
        if is_verified { p.score = (p.score + 50).min(1000); }
        p.tier = score_to_tier(p.score);
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p);
    }

    pub fn get_profile(env: Env, pioneer: Address) -> ReputationProfile {
        env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap()
    }
    pub fn get_score(env: Env, pioneer: Address) -> u32 { Self::get_profile(env, pioneer).score }
    pub fn get_tier(env: Env, pioneer: Address) -> ReputationTier { Self::get_profile(env, pioneer).tier }
    pub fn verify_threshold(env: Env, pioneer: Address, minimum_score: u32) -> bool { Self::get_score(env, pioneer) >= minimum_score }

    // v1.1: Soulbound Badges
    pub fn award_badge(env: Env, _caller: Address, pioneer: Address, badge: SoulboundBadge, reason: BytesN<32>) {
        let b = BadgeOwnership { pioneer: pioneer.clone(), badge: badge.clone(), awarded_at: env.ledger().timestamp(), award_reason: reason, revoked: false };
        env.storage().persistent().set(&badge_key(&env, &pioneer, &badge), &b);
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap();
        p.badge_count += 1; p.score = (p.score + 2).min(1000); p.tier = score_to_tier(p.score);
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p);
        env.events().publish((Symbol::new(&[], "badge_awarded"), pioneer.clone()), badge);
    }

    pub fn revoke_badge(env: Env, _caller: Address, pioneer: Address, badge: SoulboundBadge) {
        let mut b: BadgeOwnership = env.storage().persistent().get(&badge_key(&env, &pioneer, &badge)).unwrap();
        b.revoked = true; env.storage().persistent().set(&badge_key(&env, &pioneer, &badge), &b);
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap();
        p.score = p.score.saturating_sub(10); p.tier = score_to_tier(p.score);
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p);
        env.events().publish((Symbol::new(&[], "badge_revoked"), pioneer.clone()), badge);
    }

    pub fn has_badge(env: Env, pioneer: Address, badge: SoulboundBadge) -> bool {
        match env.storage().persistent().get(&badge_key(&env, &pioneer, &badge)) {
            Some(b: BadgeOwnership) => !b.revoked, None => false,
        }
    }

    // v1.1: Attestations
    pub fn create_attestation(env: Env, attester: Address, attested: Address, attestation_type: AttestationType) -> u64 {
        attester.require_auth();
        let ap: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &attester)).unwrap();
        if ap.tier == ReputationTier::Bronze { panic!("REP004: Min Silver to attest"); }
        if attester == attested { panic!("REP005: Cannot self-attest"); }
        let id: u64 = env.storage().persistent().get(&ATTEST_CTR).unwrap_or(0) + 1;
        let w: u32 = match ap.tier { ReputationTier::Silver => 2, ReputationTier::Gold => 3, ReputationTier::Platinum => 4, ReputationTier::Diamond => 5, _ => 1 };
        let a = Attestation { attestation_id: id, attester, attested: attested.clone(), attestation_type, attester_reputation: ap.score, weight: w, created_at: env.ledger().timestamp(), expires_at: env.ledger().timestamp() + 15552000, active: true };
        env.storage().persistent().set(&attest_key(&env, id), &a); env.storage().persistent().set(&ATTEST_CTR, &id);
        let mut tp: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &attested)).unwrap();
        tp.attestation_score = (tp.attestation_score + w).min(100);
        if tp.attestation_score >= 20 { tp.score = (tp.score + 5).min(1000); tp.tier = score_to_tier(tp.score); }
        env.storage().persistent().set(&rep_key(&env, &attested), &tp);
        id
    }

    pub fn revoke_attestation(env: Env, _caller: Address, attestation_id: u64) {
        let mut a: Attestation = env.storage().persistent().get(&attest_key(&env, attestation_id)).unwrap();
        if !a.active { panic!("REP006: Already revoked"); }
        a.active = false; env.storage().persistent().set(&attest_key(&env, attestation_id), &a);
    }

    // v1.1: Sybil Resistance
    pub fn update_sybil_profile(env: Env, _caller: Address, pioneer: Address, _new_counterparty: Address) {
        let mut sp: SybilProfile = env.storage().persistent().get(&sybil_key(&env, &pioneer)).unwrap_or(SybilProfile { pioneer: pioneer.clone(), unique_counterparties: 0, total_transactions: 0, reciprocal_ratio: 0, avg_tx_interval: 0, cluster_flag: false, last_analysis: 0, sybil_score: 0 });
        sp.unique_counterparties += 1; sp.total_transactions += 1;
        if sp.total_transactions >= 5 {
            let ratio = sp.unique_counterparties * 100 / sp.total_transactions;
            sp.reciprocal_ratio = ratio;
            if ratio < 30 { sp.cluster_flag = true; sp.sybil_score = 10000 - ratio * 100; }
            else { sp.cluster_flag = false; sp.sybil_score = 0; }
        }
        sp.last_analysis = env.ledger().timestamp();
        env.storage().persistent().set(&sybil_key(&env, &pioneer), &sp);
        let mut p: ReputationProfile = env.storage().persistent().get(&rep_key(&env, &pioneer)).unwrap();
        p.sybil_score = sp.sybil_score; p.unique_counterparties = sp.unique_counterparties;
        if sp.sybil_score > 5000 { p.score = p.score.saturating_sub(5); p.tier = score_to_tier(p.score); }
        env.storage().persistent().set(&rep_key(&env, &pioneer), &p);
    }

    pub fn get_sybil_profile(env: Env, pioneer: Address) -> SybilProfile {
        env.storage().persistent().get(&sybil_key(&env, &pioneer)).unwrap_or(SybilProfile { pioneer, unique_counterparties: 0, total_transactions: 0, reciprocal_ratio: 0, avg_tx_interval: 0, cluster_flag: false, last_analysis: 0, sybil_score: 0 })
    }

    pub fn get_effective_score(env: Env, pioneer: Address) -> u32 {
        let p = Self::get_profile(env, pioneer.clone()); let sp = Self::get_sybil_profile(env, pioneer);
        p.score.saturating_sub(p.score * sp.sybil_score / 20000)
    }

    pub fn verify_tier_claim(env: Env, pioneer: Address, claimed_tier: ReputationTier) -> bool {
        Self::get_tier(env, pioneer) == claimed_tier
    }
}
