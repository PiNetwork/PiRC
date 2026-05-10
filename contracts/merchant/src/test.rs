#![no_std]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};
use crate::{MerchantContract, MerchantContractClient};
use shared::{MerchantCategory, VerificationLevel};

fn setup_env() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    (env, admin)
}

#[test]
fn test_apply_verification() {
    let (env, _) = setup_env();
    let contract_id = env.register(MerchantContract, ());
    let client = MerchantContractClient::new(&env, &contract_id);
    let merchant = Address::generate(&env);
    let name_hash = BytesN::from_array(&env, &[0u8; 32]);
    let jurisdiction = BytesN::from_array(&env, &[0u8; 2]);
    let metadata = BytesN::from_array(&env, &[0u8; 32]);
    client.apply_verification(&merchant, &name_hash, &MerchantCategory::DigitalGoods, &jurisdiction, &metadata);
    let profile = client.get_merchant(&merchant);
    assert!(profile.status == shared::VerificationStatus::Pending);
}

#[test]
fn test_approve_verification() {
    let (env, admin) = setup_env();
    let contract_id = env.register(MerchantContract, ());
    let client = MerchantContractClient::new(&env, &contract_id);
    let merchant = Address::generate(&env);
    let name_hash = BytesN::from_array(&env, &[0u8; 32]);
    let jurisdiction = BytesN::from_array(&env, &[0u8; 2]);
    let metadata = BytesN::from_array(&env, &[0u8; 32]);
    client.apply_verification(&merchant, &name_hash, &MerchantCategory::Services, &jurisdiction, &metadata);
    client.approve_verification(&admin, &merchant, &VerificationLevel::Standard);
    let profile = client.get_merchant(&merchant);
    assert!(profile.status == shared::VerificationStatus::Approved);
}
