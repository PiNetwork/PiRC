#![no_std]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, Symbol};
use crate::{LoyaltyContract, LoyaltyContractClient};
use shared::LoyaltyTier;

fn setup_env() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let caller = Address::generate(&env);
    (env, caller)
}

#[test]
fn test_create_profile() {
    let (env, _) = setup_env();
    let contract_id = env.register(LoyaltyContract, ());
    let client = LoyaltyContractClient::new(&env, &contract_id);
    let pioneer = Address::generate(&env);
    let profile = client.create_profile(&pioneer);
    assert!(profile.tier == LoyaltyTier::Starter);
    assert_eq!(profile.points, 0);
}

#[test]
fn test_earn_points() {
    let (env, caller) = setup_env();
    let contract_id = env.register(LoyaltyContract, ());
    let client = LoyaltyContractClient::new(&env, &contract_id);
    let pioneer = Address::generate(&env);
    client.create_profile(&pioneer);
    client.earn_points(&caller, &pioneer, &Symbol::new(&env, "escrow"), &15u32);
    let profile = client.get_profile(&pioneer);
    assert_eq!(profile.points, 15);
    assert_eq!(profile.lifetime_points, 15);
}
