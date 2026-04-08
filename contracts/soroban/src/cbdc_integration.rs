#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC244CBDCIntegration;

#[contractimpl]
impl PiRC244CBDCIntegration {
    pub fn wrap_cbdc(env: Env, institution: Address, amount: U256) {
        institution.require_auth();
        env.events().publish((symbol_short!("CBDC"), symbol_short!("Wrapped")), (institution, amount));
    }
}
