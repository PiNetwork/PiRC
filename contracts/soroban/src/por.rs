#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, U128};

#[contract]
pub struct PiRC225PoR;

#[contractimpl]
impl PiRC225PoR {
    pub fn attest_reserve(env: Env, asset: String, amount: U128) {
        env.storage().instance().set(&asset, &amount);
    }
}

