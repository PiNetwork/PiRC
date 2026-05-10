#![no_std]
use soroban_sdk::{testutils::{Address as _, Ledger as _}, Address, BytesN, Env, Vec};
use crate::{EscrowContract, EscrowContractClient};

fn setup_env() -> (Env, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let coordinator = Address::generate(&env);
    let token_id = Address::generate(&env);
    (env, coordinator, token_id)
}

#[test]
fn test_create_escrow() {
    let (env, coordinator, token_id) = setup_env();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let metadata = BytesN::from_array(&env, &[0u8; 32]);

    client.initialize(&coordinator, &100u32);

    let id = client.create_escrow(
        &buyer, &seller, &1000i128, &token_id, &env.ledger().timestamp() + 86400,
        &86400u64, &metadata,
    );
    assert_eq!(id, 1);
}

#[test]
fn test_escrow_lifecycle() {
    let (env, coordinator, token_id) = setup_env();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let metadata = BytesN::from_array(&env, &[0u8; 32]);

    client.initialize(&coordinator, &100u32);

    let id = client.create_escrow(
        &buyer, &seller, &1000i128, &token_id, &env.ledger().timestamp() + 86400,
        &86400u64, &metadata,
    );

    let escrow = client.get_escrow(&id);
    assert!(escrow.state == shared::EscrowState::Created);
}

#[test]
fn test_initialize_fee_exceeds_max() {
    let (env, coordinator, _) = setup_env();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    let result = client.try_initialize(&coordinator, &1001u32);
    assert!(result.is_err());
}
