// contracts/activity_oracle.rs
// PiRC Activity Oracle
// Advanced Activity Measurement Engine
// MIT License

use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

pub type Address = String;

#[derive(Clone, Debug)]
pub struct ActivityMetrics {
    pub transactions: u64,
    pub dapp_interactions: u64,
    pub liquidity_contribution: f64,
    pub governance_votes: u64,
    pub last_update: u64,
}

#[derive(Clone, Debug)]
pub struct ActivityScore {
    pub raw_score: f64,
    pub normalized_score: f64,
    pub timestamp: u64,
}

#[derive(Clone, Debug)]
pub struct OracleParameters {
    pub tx_weight: f64,
    pub dapp_weight: f64,
    pub liquidity_weight: f64,
    pub governance_weight: f64,
    pub decay_factor: f64,
}

pub struct ActivityOracle {
    pub metrics: HashMap<Address, ActivityMetrics>,
    pub scores: HashMap<Address, ActivityScore>,
    pub parameters: OracleParameters,
}

impl ActivityOracle {

    pub fn new() -> Self {
        Self {
            metrics: HashMap::new(),
            scores: HashMap::new(),
            parameters: OracleParameters {
                tx_weight: 0.25,
                dapp_weight: 0.25,
                liquidity_weight: 0.30,
                governance_weight: 0.20,
                decay_factor: 0.98,
            },
        }
    }

    fn now() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    pub fn record_transaction(&mut self, user: Address) {
        let entry = self.metrics.entry(user).or_insert(ActivityMetrics {
            transactions: 0,
            dapp_interactions: 0,
            liquidity_contribution: 0.0,
            governance_votes: 0,
            last_update: Self::now(),
        });

        entry.transactions += 1;
        entry.last_update = Self::now();
    }

    pub fn record_dapp_interaction(&mut self, user: Address) {
        let entry = self.metrics.entry(user).or_insert(ActivityMetrics {
            transactions: 0,
            dapp_interactions: 0,
            liquidity_contribution: 0.0,
            governance_votes: 0,
            last_update: Self::now(),
        });

        entry.dapp_interactions += 1;
        entry.last_update = Self::now();
    }

    pub fn record_liquidity(&mut self, user: Address, amount: f64) {
        let entry = self.metrics.entry(user).or_insert(ActivityMetrics {
            transactions: 0,
            dapp_interactions: 0,
            liquidity_contribution: 0.0,
            governance_votes: 0,
            last_update: Self::now(),
        });

        entry.liquidity_contribution += amount;
        entry.last_update = Self::now();
    }

    pub fn record_governance_vote(&mut self, user: Address) {
        let entry = self.metrics.entry(user).or_insert(ActivityMetrics {
            transactions: 0,
            dapp_interactions: 0,
            liquidity_contribution: 0.0,
            governance_votes: 0,
            last_update: Self::now(),
        });

        entry.governance_votes += 1;
        entry.last_update = Self::now();
    }

    pub fn compute_score(&mut self, user: &Address) -> Option<ActivityScore> {

        let metrics = self.metrics.get(user)?;

        let raw_score =
            metrics.transactions as f64 * self.parameters.tx_weight +
            metrics.dapp_interactions as f64 * self.parameters.dapp_weight +
            metrics.liquidity_contribution * self.parameters.liquidity_weight +
            metrics.governance_votes as f64 * self.parameters.governance_weight;

        let age = Self::now() - metrics.last_update;

        let decay = self.parameters.decay_factor.powf(age as f64 / 86400.0);

        let normalized = raw_score * decay;

        let score = ActivityScore {
            raw_score,
            normalized_score: normalized,
            timestamp: Self::now(),
        };

        self.scores.insert(user.clone(), score.clone());

        Some(score)
    }

    pub fn get_score(&self, user: &Address) -> Option<&ActivityScore> {
        self.scores.get(user)
    }

    pub fn update_parameters(&mut self, params: OracleParameters) {
        self.parameters = params;
    }

    pub fn batch_compute(&mut self) {
        let users: Vec<Address> = self.metrics.keys().cloned().collect();

        for user in users {
            self.compute_score(&user);
        }
    }

    pub fn top_active_users(&self, limit: usize) -> Vec<(Address, f64)> {

        let mut scores: Vec<(Address, f64)> = self.scores
            .iter()
            .map(|(addr, score)| (addr.clone(), score.normalized_score))
            .collect();

        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());

        scores.into_iter().take(limit).collect()
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn activity_score_calculation() {

        let mut oracle = ActivityOracle::new();

        let user = "pioneer1".to_string();

        oracle.record_transaction(user.clone());
        oracle.record_transaction(user.clone());
        oracle.record_dapp_interaction(user.clone());
        oracle.record_liquidity(user.clone(), 50.0);
        oracle.record_governance_vote(user.clone());

        let score = oracle.compute_score(&user).unwrap();

        assert!(score.raw_score > 0.0);
    }
}
