#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC257FeeAbstraction;

#[contractimpl]
impl PiRC257FeeAbstraction {
    pub fn sponsor_gas(env: Env, paymaster: Address, user: Address, amount: U256) {
        paymaster.require_auth();
        env.events().publish((symbol_short!("FeeAbst"), symbol_short!("Paid")), (user, amount));
    }
}
