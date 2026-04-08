#![no_std]
use soroban_sdk::{contractimpl, Env, Address};

pub struct TreasuryVault;

#[contractimpl]
impl TreasuryVault {
    pub fn deposit(env: Env, user: Address, amount: u64) {
        let key = (b"vault", user.clone());
        let mut bal: u64 = env.storage().get(&key).unwrap_or(0);
        bal += amount;
        env.storage().set(&key, &bal);
    }

    pub fn withdraw(env: Env, user: Address, amount: u64) -> bool {
        let key = (b"vault", user.clone());
        let mut bal: u64 = env.storage().get(&key).unwrap_or(0);
        if bal < amount { return false; }
        bal -= amount;
        env.storage().set(&key, &bal);
        true
    }
}
