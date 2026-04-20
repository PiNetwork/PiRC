mod pirc_config;
#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Env, Address, Vec, Symbol, Map, log
};

#[contracttype]
pub enum DataKey {
    FeePool
}

#[contract]
pub struct RewardController;

#[contractimpl]
impl RewardController {

    // Deposit fees ke pool
    pub fn deposit_fees(env: Env, amount: i128) {

        let mut pool: i128 =
            env.storage()
            .instance()
            .get(&DataKey::FeePool)
            .unwrap_or(0);

        pool += amount;

        env.storage().instance().set(&DataKey::FeePool, &pool);
    }

    // Distribusi reward berdasarkan bobot
    pub fn distribute(
        env: Env,
        users: Vec<Address>,
        weights: Vec<i128>
    ) {

        let pool: i128 =
            env.storage()
            .instance()
            .get(&DataKey::FeePool)
            .unwrap_or(0);

        if users.len() != weights.len() {
            panic!("length mismatch");
        }

        let mut total_weight: i128 = 0;

        for w in weights.iter() {
            total_weight += w;
        }

        if total_weight == 0 {
            panic!("invalid weight");
        }

        for i in 0..users.len() {

            let user = users.get(i).unwrap();
            let weight = weights.get(i).unwrap();

            let reward = (pool * weight) / total_weight;

            // di sini biasanya dilakukan token transfer
            log!(&env, "reward", user, reward);
        }
    }

    pub fn fee_pool(env: Env) -> i128 {

        env.storage()
        .instance()
        .get(&DataKey::FeePool)
        .unwrap_or(0)
    }
}
