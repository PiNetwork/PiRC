#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Bytes, BytesN};

#[contract]
pub struct PiRC248MultiChainGov;

#[contractimpl]
impl PiRC248MultiChainGov {
    pub fn execute_remote_proposal(env: Env, executor: Address, proposal_id: u32, payload: Bytes) {
        executor.require_auth();
        env.events().publish((symbol_short!("MultiGov"), symbol_short!("Exec")), (proposal_id, payload));
    }
}
