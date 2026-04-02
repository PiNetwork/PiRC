#![no_std]

use soroban_sdk::{
    contract, contractimpl, Env, Address, Vec, Map
};

#[contract]
pub struct RewardEngine;

#[contractimpl]
impl RewardEngine {

    // =========================
    // Storage Keys
    // =========================
    fn balances(e: &Env) -> Map<Address, u64> {
        e.storage().instance().get(&"balances").unwrap_or(Map::new(e))
    }

    fn set_balances(e: &Env, map: Map<Address, u64>) {
        e.storage().instance().set(&"balances", &map);
    }

    // =========================
    // Reward Formula
    // =========================
    pub fn calculate_reward(
        _env: Env,
        attention: u64,
        quality: u64,
        verification: u64,
    ) -> u64 {
        attention * quality * verification
    }

    // =========================
    // Mint Token (core)
    // =========================
    pub fn mint(
        env: Env,
        user: Address,
        reward: u64,
    ) {
        let mut balances = Self::balances(&env);

        let current = balances.get(user.clone()).unwrap_or(0);
        balances.set(user, current + reward);

        Self::set_balances(&env, balances);
    }

    // =========================
    // Batch Mint
    // =========================
    pub fn distribute_rewards(
        env: Env,
        users: Vec<Address>,
        rewards: Vec<u64>,
    ) {
        let mut balances = Self::balances(&env);

        let len = users.len();

        for i in 0..len {
            let user = users.get(i).unwrap();
            let reward = rewards.get(i).unwrap();

            let current = balances.get(user.clone()).unwrap_or(0);
            balances.set(user, current + reward);
        }

        Self::set_balances(&env, balances);
    }

    // =========================
    // View Balance
    // =========================
    pub fn get_balance(env: Env, user: Address) -> u64 {
        let balances = Self::balances(&env);
        balances.get(user).unwrap_or(0)
    }
}
