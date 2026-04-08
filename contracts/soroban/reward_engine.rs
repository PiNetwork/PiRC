#![no_std]
use soroban_sdk::{contractimpl, Env, Address, Map};

pub struct RewardEngine;

#[contractimpl]
impl RewardEngine {
    pub fn claim_reward(env: Env, user: Address, amount: u64) {
        let key = (b"claimed", user.clone());
        let mut claimed: u64 = env.storage().get(&key).unwrap_or(0);
        claimed += amount;
        env.storage().set(&key, &claimed);

        // mint ke user
        env.invoke_contract::<()>(
            &env.current_contract_address(),
            &soroban_sdk::Symbol::new(&env, "mint"),
            &(user, amount),
        );
    }

    pub fn total_claimed(env: Env, user: Address) -> u64 {
        env.storage().get(&(b"claimed", user)).unwrap_or(0)
    }
}
