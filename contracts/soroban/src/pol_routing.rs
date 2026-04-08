#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC251POLRouting;

#[contractimpl]
impl PiRC251POLRouting {
    pub fn deploy_pol(env: Env, admin: Address, token: Address, amount: U256) {
        admin.require_auth();
        env.events().publish((symbol_short!("POL"), symbol_short!("Deployed")), (token, amount));
    }
}
