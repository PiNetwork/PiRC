#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Symbol};

#[contract]
pub struct RwaVerify;

#[contractimpl]
impl RwaVerify {
    pub fn hello(_env: Env) -> Symbol {
        Symbol::short("OK")
    }
}
