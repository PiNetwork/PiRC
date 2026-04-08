#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, Symbol};

#[contract]
pub struct PiRC221ZKIdentity;

#[contractimpl]
impl PiRC221ZKIdentity {
    pub fn commit_proof(env: Env, user: Address, proof_hash: BytesN<32>) {
        user.require_auth();
        let key = (symbol_short!("proof"), user.clone());
        env.storage().persistent().set(&key, &proof_hash);
        
        env.events().publish(
            (symbol_short!("identity"), symbol_short!("committed")),
            user
        );
    }

    pub fn is_verified(env: Env, user: Address) -> bool {
        let key = (symbol_short!("proof"), user);
        env.storage().persistent().has(&key)
    }
}

