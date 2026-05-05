use soroban_sdk::{contractimpl, Address, Env, Symbol};

pub struct RewardEngine;

#[contractimpl]
impl RewardEngine {
    pub fn distribute(env: Env, user: Address, amount: u128) {
        let key = Symbol::short(&format!("reward_{}", user));
        let bal: u128 = env.storage().get(&key).unwrap_or(0);
        env.storage().set(&key, &(bal + amount));
    }

    pub fn claim(env: Env, user: Address) -> u128 {
        let key = Symbol::short(&format!("reward_{}", user));
        let bal: u128 = env.storage().get(&key).unwrap_or(0);
        env.storage().set(&key, &0u128);
        bal
    }
}
