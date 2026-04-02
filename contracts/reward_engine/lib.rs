#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Symbol, symbol_short, Vec};

#[contract]
pub struct RewardEngine;

#[contractimpl]
impl RewardEngine {

    // =========================
    // Core Reward Calculation
    // =========================
    pub fn calculate_reward(
        _env: Env,
        attention: u64,
        quality: u64,
        verification: u64,
    ) -> u64 {
        // Simple multiplication model
        attention * quality * verification
    }

    // =========================
    // Batch Calculation (optional)
    // =========================
    pub fn batch_rewards(
        env: Env,
        attentions: Vec<u64>,
        qualities: Vec<u64>,
        verifications: Vec<u64>,
    ) -> Vec<u64> {

        let mut rewards = Vec::new(&env);

        let len = attentions.len();

        for i in 0..len {
            let a = attentions.get(i).unwrap();
            let q = qualities.get(i).unwrap();
            let v = verifications.get(i).unwrap();

            let r = a * q * v;
            rewards.push_back(r);
        }

        rewards
    }

    // =========================
    // Normalization (anti inflation)
    // =========================
    pub fn normalize_rewards(
        env: Env,
        rewards: Vec<u64>,
        max_emission: u64,
    ) -> Vec<u64> {

        let mut total: u64 = 0;

        for r in rewards.iter() {
            total += r;
        }

        let mut normalized = Vec::new(&env);

        if total == 0 {
            return normalized;
        }

        for r in rewards.iter() {
            let scaled = (r * max_emission) / total;
            normalized.push_back(scaled);
        }

        normalized
    }

    // =========================
    // Simple Anti-Bot Filter
    // =========================
    pub fn apply_verification_threshold(
        env: Env,
        rewards: Vec<u64>,
        verifications: Vec<u64>,
        threshold: u64,
    ) -> Vec<u64> {

        let mut filtered = Vec::new(&env);

        let len = rewards.len();

        for i in 0..len {
            let r = rewards.get(i).unwrap();
            let v = verifications.get(i).unwrap();

            if v >= threshold {
                filtered.push_back(r);
            } else {
                filtered.push_back(0);
            }
        }

        filtered
    }
}
