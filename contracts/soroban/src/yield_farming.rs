#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC240YieldFarming;

#[contractimpl]
impl PiRC240YieldFarming {
    pub fn route_capital(env: Env, admin: Address, target: Address, amount: U256) {
        admin.require_auth();
        env.events().publish((symbol_short!("YieldFarm"), symbol_short!("Routed")), (target, amount));
    }
}
