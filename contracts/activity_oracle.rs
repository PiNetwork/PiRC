// contracts/activity_oracle.rs
// PiRC Activity Oracle Engine
// Advanced Pioneer Activity Scoring System
// MIT License

use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

pub type Address = String;

const SECONDS_PER_DAY: u64 = 86400;

#[derive(Clone, Debug)]
pub struct ActivityMetrics {

    pub transactions: u64,
    pub dapp_calls: u64,
    pub liquidity_volume: f64,
    pub governance_votes: u64,
    pub stake_lock_days: u64,

    pub first_seen: u64,
    pub last_activity: u64,
}

#[derive(Clone, Debug)]
pub struct ActivityScore {

    pub raw_score: f64,
    pub decay_score: f64,
    pub sybil_risk: f64,
    pub final_score: f64,

    pub timestamp: u64,
}

#[derive(Clone, Debug)]
pub struct OracleParams {

    pub tx_weight: f64,
    pub dapp_weight: f64,
    pub liquidity_weight: f64,
    pub governance_weight: f64,
    pub staking_weight: f64,

    pub decay_rate: f64,
    pub sybil_penalty: f64,

    pub max_score: f64,
}

pub struct ActivityOracle {

    metrics: HashMap<Address, ActivityMetrics>,
    scores: HashMap<Address, ActivityScore>,
    params: OracleParams,
}

impl ActivityOracle {

    pub fn new() -> Self {

        Self {

            metrics: HashMap::new(),
            scores: HashMap::new(),

            params: OracleParams {

                tx_weight: 0.20,
                dapp_weight: 0.25,
                liquidity_weight: 0.30,
                governance_weight: 0.15,
                staking_weight: 0.10,

                decay_rate: 0.97,
                sybil_penalty: 0.4,

                max_score: 1000.0,
            },
        }
    }

    fn now() -> u64 {

        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn ensure_user(&mut self, user: &Address) {

        self.metrics.entry(user.clone()).or_insert(

            ActivityMetrics {

                transactions: 0,
                dapp_calls: 0,
                liquidity_volume: 0.0,
                governance_votes: 0,
                stake_lock_days: 0,

                first_seen: Self::now(),
                last_activity: Self::now(),
            }
        );
    }

    pub fn record_transaction(&mut self, user: Address) {

        self.ensure_user(&user);

        let m = self.metrics.get_mut(&user).unwrap();

        m.transactions += 1;
        m.last_activity = Self::now();
    }

    pub fn record_dapp_call(&mut self, user: Address) {

        self.ensure_user(&user);

        let m = self.metrics.get_mut(&user).unwrap();

        m.dapp_calls += 1;
        m.last_activity = Self::now();
    }

    pub fn record_liquidity(&mut self, user: Address, amount: f64) {

        self.ensure_user(&user);

        let m = self.metrics.get_mut(&user).unwrap();

        m.liquidity_volume += amount;
        m.last_activity = Self::now();
    }

    pub fn record_governance_vote(&mut self, user: Address) {

        self.ensure_user(&user);

        let m = self.metrics.get_mut(&user).unwrap();

        m.governance_votes += 1;
        m.last_activity = Self::now();
    }

    pub fn record_staking(&mut self, user: Address, lock_days: u64) {

        self.ensure_user(&user);

        let m = self.metrics.get_mut(&user).unwrap();

        m.stake_lock_days += lock_days;
        m.last_activity = Self::now();
    }

    fn compute_raw_score(&self, m: &ActivityMetrics) -> f64 {

        let tx_score =
            m.transactions as f64 * self.params.tx_weight;

        let dapp_score =
            m.dapp_calls as f64 * self.params.dapp_weight;

        let liquidity_score =
            m.liquidity_volume * self.params.liquidity_weight;

        let gov_score =
            m.governance_votes as f64 * self.params.governance_weight;

        let stake_score =
            m.stake_lock_days as f64 * self.params.staking_weight;

        tx_score + dapp_score + liquidity_score + gov_score + stake_score
    }

    fn compute_decay(&self, last_activity: u64) -> f64 {

        let now = Self::now();

        let inactive_days =
            (now - last_activity) as f64 / SECONDS_PER_DAY as f64;

        self.params.decay_rate.powf(inactive_days)
    }

    fn detect_sybil_risk(&self, m: &ActivityMetrics) -> f64 {

        let wallet_age_days =
            (Self::now() - m.first_seen) / SECONDS_PER_DAY;

        let tx_rate =
            m.transactions as f64 / (wallet_age_days.max(1) as f64);

        if wallet_age_days < 7 && tx_rate > 100.0 {

            return self.params.sybil_penalty;
        }

        if m.liquidity_volume == 0.0 && m.transactions > 500 {

            return self.params.sybil_penalty * 0.5;
        }

        0.0
    }

    pub fn compute_score(&mut self, user: &Address)
        -> Option<ActivityScore>
    {

        let metrics = self.metrics.get(user)?;

        let raw = self.compute_raw_score(metrics);

        let decay =
            self.compute_decay(metrics.last_activity);

        let decay_score = raw * decay;

        let sybil =
            self.detect_sybil_risk(metrics);

        let mut final_score =
            decay_score * (1.0 - sybil);

        if final_score > self.params.max_score {

            final_score = self.params.max_score;
        }

        let score = ActivityScore {

            raw_score: raw,
            decay_score,
            sybil_risk: sybil,
            final_score,

            timestamp: Self::now(),
        };

        self.scores.insert(user.clone(), score.clone());

        Some(score)
    }

    pub fn batch_update(&mut self) {

        let users: Vec<Address> =
            self.metrics.keys().cloned().collect();

        for user in users {

            self.compute_score(&user);
        }
    }

    pub fn get_score(&self, user: &Address)
        -> Option<&ActivityScore>
    {

        self.scores.get(user)
    }

    pub fn leaderboard(&self, limit: usize)
        -> Vec<(Address, f64)>
    {

        let mut scores: Vec<(Address, f64)> =

            self.scores
                .iter()
                .map(|(u, s)| (u.clone(), s.final_score))
                .collect();

        scores.sort_by(|a, b|
            b.1.partial_cmp(&a.1).unwrap());

        scores.into_iter().take(limit).collect()
    }

    pub fn update_params(&mut self, params: OracleParams) {

        self.params = params;
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_activity_score() {

        let mut oracle = ActivityOracle::new();

        let user = "pioneer_wallet".to_string();

        oracle.record_transaction(user.clone());
        oracle.record_transaction(user.clone());

        oracle.record_dapp_call(user.clone());

        oracle.record_liquidity(user.clone(), 100.0);

        oracle.record_governance_vote(user.clone());

        oracle.record_staking(user.clone(), 30);

        let score =
            oracle.compute_score(&user).unwrap();

        assert!(score.final_score > 0.0);
    }
}
