#![no_std]
use soroban_sdk::{contract, contractimpl, Symbol, Address, BytesN, Env, Vec};
use shared::{DisputeCategory, DisputeRuling, DisputePhase, ReputationTier, JurorSpecialty, JurorVote, JurorVettingProfile, DisputeCase};

#[cfg(test)]
mod test;

const DISPUTE_CTR: Symbol = Symbol::new(&[], "dis_ctr");
fn dispute_key(_env: &Env, id: u64) -> Symbol { Symbol::new(&[], &format!("dis_{}", id).as_str()) }
fn juror_key(_env: &Env, _addr: &Address) -> Symbol { Symbol::new(&[], "juror") }

fn tier_weight(tier: &ReputationTier) -> u32 {
    match tier { ReputationTier::Bronze => 1, ReputationTier::Silver => 2, ReputationTier::Gold => 3, ReputationTier::Platinum => 4, ReputationTier::Diamond => 5 }
}

fn score_to_tier(score: u32) -> ReputationTier {
    if score >= 900 { ReputationTier::Diamond } else if score >= 700 { ReputationTier::Platinum }
    else if score >= 450 { ReputationTier::Gold } else if score >= 200 { ReputationTier::Silver }
    else { ReputationTier::Bronze }
}

#[contract]
pub struct DisputeContract;

#[contractimpl]
impl DisputeContract {
    pub fn open_dispute(env: Env, _caller: Address, escrow_id: u64, filer: Address, respondent: Address, category: DisputeCategory, initial_evidence: BytesN<32>, jurors: Vec<Address>) -> u64 {
        let id: u64 = env.storage().persistent().get(&DISPUTE_CTR).unwrap_or(0) + 1;
        let now = env.ledger().timestamp();
        let mut fe = Vec::new(&env); fe.push_back(initial_evidence);
        let dc = DisputeCase {
            dispute_id: id, escrow_id, filer, respondent, category, phase: DisputePhase::Evidence,
            jurors, votes: Vec::new(&env), filer_evidence: fe, respondent_evidence: Vec::new(&env),
            filed_at: now, evidence_deadline: now + 259200, voting_deadline: now + 432000,
            ruling: None, is_appealed: false, appeal_fee: 0,
        };
        env.storage().persistent().set(&dispute_key(&env, id), &dc);
        env.storage().persistent().set(&DISPUTE_CTR, &id);
        env.events().publish((Symbol::new(&[], "dispute_opened"), id), escrow_id);
        id
    }

    pub fn submit_evidence(env: Env, party: Address, dispute_id: u64, evidence_hash: BytesN<32>) {
        let mut dc: DisputeCase = env.storage().persistent().get(&dispute_key(&env, dispute_id)).unwrap();
        if dc.phase != DisputePhase::Evidence { panic!("DIS001: Not evidence phase"); }
        if env.ledger().timestamp() > dc.evidence_deadline { panic!("DIS002: Deadline passed"); }
        if party == dc.filer { dc.filer_evidence.push_back(evidence_hash); }
        else if party == dc.respondent { dc.respondent_evidence.push_back(evidence_hash); }
        else { panic!("DIS003: Not a party"); }
        env.storage().persistent().set(&dispute_key(&env, dispute_id), &dc);
    }

    pub fn start_voting(env: Env, _caller: Address, dispute_id: u64) {
        let mut dc: DisputeCase = env.storage().persistent().get(&dispute_key(&env, dispute_id)).unwrap();
        dc.phase = DisputePhase::Voting;
        env.storage().persistent().set(&dispute_key(&env, dispute_id), &dc);
    }

    pub fn commit_vote(env: Env, juror: Address, dispute_id: u64, _commitment: BytesN<32>) {
        juror.require_auth();
        let dc: DisputeCase = env.storage().persistent().get(&dispute_key(&env, dispute_id)).unwrap();
        if dc.phase != DisputePhase::Voting { panic!("DIS005: Not voting phase"); }
        if !dc.jurors.contains(&juror) { panic!("DIS006: Not a juror"); }
    }

    pub fn reveal_vote(env: Env, juror: Address, dispute_id: u64, vote: DisputeRuling, confidence: u8, justification_hash: BytesN<32>) {
        juror.require_auth();
        let mut dc: DisputeCase = env.storage().persistent().get(&dispute_key(&env, dispute_id)).unwrap();
        let jv = JurorVote { juror: juror.clone(), vote, confidence, voted_at: env.ledger().timestamp(), justification_hash };
        dc.votes.push_back(jv);
        env.storage().persistent().set(&dispute_key(&env, dispute_id), &dc);
    }

    pub fn execute_ruling(env: Env, _caller: Address, dispute_id: u64) -> (DisputeRuling, u32) {
        let mut dc: DisputeCase = env.storage().persistent().get(&dispute_key(&env, dispute_id)).unwrap();
        if dc.votes.is_empty() { panic!("DIS011: No votes revealed"); }
        let mut counts: [u32; 5] = [0; 5];
        for i in 0..dc.votes.len() {
            let v = dc.votes.get(i).unwrap();
            match v.vote {
                DisputeRuling::FullRefund => counts[0] += 1, DisputeRuling::PartialRefund => counts[1] += 1,
                DisputeRuling::SellerFavored => counts[2] += 1, DisputeRuling::Split => counts[3] += 1,
                DisputeRuling::Dismissed => counts[4] += 1,
            }
        }
        let max_idx = counts.iter().enumerate().max_by_key(|&(_, c)| c).map(|(i, _)| i).unwrap_or(0);
        let ruling = match max_idx { 0 => DisputeRuling::FullRefund, 1 => DisputeRuling::PartialRefund, 2 => DisputeRuling::SellerFavored, 3 => DisputeRuling::Split, _ => DisputeRuling::Dismissed };
        dc.ruling = Some(ruling.clone()); dc.phase = DisputePhase::Final;
        env.storage().persistent().set(&dispute_key(&env, dispute_id), &dc);
        (ruling, dc.votes.len() as u32)
    }

    // v1.1: Juror Vetting
    pub fn register_juror(env: Env, juror: Address, specialty: JurorSpecialty, reputation_score: u32, stake: i128) {
        juror.require_auth();
        if reputation_score < 200 { panic!("DIS012: Min Silver reputation"); }
        if stake < 10_0000000 { panic!("DIS013: Min 10 Pi stake"); }
        let jp = JurorVettingProfile { juror: juror.clone(), reputation_score, cases_served: 0, cases_consensus: 0, consensus_rate: 0, specialty, active: true, stake, last_served: 0, penalty_points: 0 };
        env.storage().persistent().set(&juror_key(&env, &juror), &jp);
        env.events().publish((Symbol::new(&[], "juror_registered"), juror), specialty);
    }

    pub fn deactivate_juror(env: Env, juror: Address) {
        juror.require_auth();
        let mut jp: JurorVettingProfile = env.storage().persistent().get(&juror_key(&env, &juror)).unwrap();
        jp.active = false; env.storage().persistent().set(&juror_key(&env, &juror), &jp);
    }

    pub fn get_juror_profile(env: Env, juror: Address) -> JurorVettingProfile {
        env.storage().persistent().get(&juror_key(&env, &juror)).unwrap()
    }

    pub fn is_juror_eligible(env: Env, juror: Address, _category: DisputeCategory) -> bool {
        match env.storage().persistent().get(&juror_key(&env, &juror)) {
            Some(jp: JurorVettingProfile) => jp.active && jp.penalty_points < 4, None => false,
        }
    }

    // v1.1: Weighted Ruling
    pub fn execute_weighted_ruling(env: Env, _caller: Address, dispute_id: u64) -> (DisputeRuling, u32, u32) {
        let mut dc: DisputeCase = env.storage().persistent().get(&dispute_key(&env, dispute_id)).unwrap();
        if dc.votes.is_empty() { panic!("DIS011: No votes revealed"); }
        let mut weights: [u32; 5] = [0; 5];
        for i in 0..dc.votes.len() {
            let v = dc.votes.get(i).unwrap();
            let jp: JurorVettingProfile = env.storage().persistent().get(&juror_key(&env, &v.juror)).unwrap_or(JurorVettingProfile { juror: v.juror.clone(), reputation_score: 200, cases_served: 0, cases_consensus: 0, consensus_rate: 0, specialty: JurorSpecialty::General, active: true, stake: 0, last_served: 0, penalty_points: 0 });
            let tier = score_to_tier(jp.reputation_score);
            let mut w = tier_weight(&tier);
            if jp.consensus_rate > 80 && jp.cases_served >= 3 { w += 1; }
            match v.vote {
                DisputeRuling::FullRefund => weights[0] += w, DisputeRuling::PartialRefund => weights[1] += w,
                DisputeRuling::SellerFavored => weights[2] += w, DisputeRuling::Split => weights[3] += w,
                DisputeRuling::Dismissed => weights[4] += w,
            }
        }
        let max_idx = weights.iter().enumerate().max_by_key(|&(_, c)| c).map(|(i, _)| i).unwrap_or(0);
        let ruling = match max_idx { 0 => DisputeRuling::FullRefund, 1 => DisputeRuling::PartialRefund, 2 => DisputeRuling::SellerFavored, 3 => DisputeRuling::Split, _ => DisputeRuling::Dismissed };
        dc.ruling = Some(ruling.clone()); dc.phase = DisputePhase::Final;
        env.storage().persistent().set(&dispute_key(&env, dispute_id), &dc);
        (ruling, dc.votes.len() as u32, weights.iter().sum())
    }
}
