#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, BytesN};

#[contract]
pub struct PiRC245SettlementBatching;

#[contractimpl]
impl PiRC245SettlementBatching {
    pub fn submit_batch(env: Env, operator: Address, batch_id: u32, state_root: BytesN<32>) {
        operator.require_auth();
        env.events().publish((symbol_short!("Batch"), symbol_short!("Submit")), (batch_id, state_root));
    }
}
