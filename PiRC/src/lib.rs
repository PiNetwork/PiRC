mod pirc_config;
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Vec};

#[contract]
pub struct PiRCMacroEngine;

#[contractimpl]
impl PiRCMacroEngine {
    pub fn calculate_wcf(env: Env, balance: i128, lock_time: u64) -> i128 {
        let years = (lock_time / 31536000) + 1;
        balance * (years as i128)
    }

    pub fn apply_qwf(env: Env, amount: i128) -> i128 {
        if amount > 1000000 { (amount * 110) / 100 } else { amount }
    }
}
