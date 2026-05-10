#![no_std]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};
use crate::{ReputationContract, ReputationContractClient};
use shared::{ReputationTier, SoulboundBadge, AttestationType};

fn setup_env() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let caller = Address::generate(&env);
    (env, caller)
}

#[test]
fn test_create_profile() {
    let (env, _) = setup_env();
    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    let pioneer = Address::generate(&env);
    let profile = client.create_profile(&pioneer);
    assert_eq!(profile.score, 200);
    assert!(profile.tier == ReputationTier::Silver);
}

#[test]
fn test_escrow_completion() {
    let (env, caller) = setup_env();
    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    let pioneer = Address::generate(&env);
    client.create_profile(&pioneer);
    let score = client.record_escrow_completion(&caller, &pioneer, &true);
    assert_eq!(score, 205);
}

#[test]
fn test_escrow_expiry() {
    let (env, caller) = setup_env();
    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    let seller = Address::generate(&env);
    client.create_profile(&seller);
    let score = client.record_escrow_expiry(&caller, &seller);
    assert_eq!(score, 185);
}

#[test]
fn test_award_badge() {
    let (env, caller) = setup_env();
    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    let pioneer = Address::generate(&env);
    client.create_profile(&pioneer);
    let reason = BytesN::from_array(&env, &[1u8; 32]);
    client.award_badge(&caller, &pioneer, &SoulboundBadge::FirstTrade, &reason);
    assert!(client.has_badge(&pioneer, &SoulboundBadge::FirstTrade));
    let profile = client.get_profile(&pioneer);
    assert_eq!(profile.badge_count, 1);
    assert_eq!(profile.score, 202);
}

#[test]
fn test_verify_threshold() {
    let (env, _) = setup_env();
    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);
    let pioneer = Address::generate(&env);
    client.create_profile(&pioneer);
    assert!(client.verify_threshold(&pioneer, &200u32));
    assert!(!client.verify_threshold(&pioneer, &500u32));
}
