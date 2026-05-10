#![no_std]
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, Vec};
use crate::{DisputeContract, DisputeContractClient};
use shared::{DisputeCategory, DisputeRuling, JurorSpecialty};

fn setup_env() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let caller = Address::generate(&env);
    (env, caller)
}

#[test]
fn test_register_juror() {
    let (env, _) = setup_env();
    let contract_id = env.register(DisputeContract, ());
    let client = DisputeContractClient::new(&env, &contract_id);
    let juror = Address::generate(&env);
    client.register_juror(&juror, &JurorSpecialty::Commerce, &300u32, &10_0000000i128);
    let profile = client.get_juror_profile(&juror);
    assert!(profile.active);
    assert_eq!(profile.reputation_score, 300);
}

#[test]
fn test_juror_eligibility() {
    let (env, _) = setup_env();
    let contract_id = env.register(DisputeContract, ());
    let client = DisputeContractClient::new(&env, &contract_id);
    let juror = Address::generate(&env);
    client.register_juror(&juror, &JurorSpecialty::General, &250u32, &10_0000000i128);
    assert!(client.is_juror_eligible(&juror, &DisputeCategory::NonDelivery));
}

#[test]
fn test_open_dispute() {
    let (env, caller) = setup_env();
    let contract_id = env.register(DisputeContract, ());
    let client = DisputeContractClient::new(&env, &contract_id);
    let filer = Address::generate(&env);
    let respondent = Address::generate(&env);
    let evidence = BytesN::from_array(&env, &[0u8; 32]);
    let jurors = Vec::new(&env);
    let id = client.open_dispute(&caller, &1u64, &filer, &respondent, &DisputeCategory::NonDelivery, &evidence, &jurors);
    assert_eq!(id, 1);
}
