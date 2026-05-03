 core/reward-logic

mod pirc_config;
 main
use std::collections::HashMap;

pub struct RewardEngine {

    pub treasury_balance: u128,
    pub reward_multiplier: f64,

    pub activity_scores: HashMap<String, u128>,
    pub liquidity_scores: HashMap<String, u128>,
    pub reward_balances: HashMap<String, u128>,

}

impl RewardEngine {

    pub fn new(initial_treasury: u128) -> Self {

        Self {
            treasury_balance: initial_treasury,
            reward_multiplier: 1.0,
            activity_scores: HashMap::new(),
            liquidity_scores: HashMap::new(),
            reward_balances: HashMap::new(),
        }

    }

    pub fn record_activity(&mut self, user: String, score: u128) {

        let entry = self.activity_scores.entry(user).or_insert(0);
        *entry += score;

    }

    pub fn record_liquidity(&mut self, user: String, amount: u128) {

        let entry = self.liquidity_scores.entry(user).or_insert(0);
        *entry += amount;

    }

    fn anti_sybil_filter(activity: u128) -> u128 {

        if activity < 10 {
            0
        } else {
            activity
        }

    }

    pub fn calculate_reward(&self, user: &String) -> u128 {

        let activity = self.activity_scores.get(user).unwrap_or(&0);
        let liquidity = self.liquidity_scores.get(user).unwrap_or(&0);

        let filtered_activity = Self::anti_sybil_filter(*activity);

        let base_reward =
            filtered_activity * 10 +
            liquidity * 5;

        (base_reward as f64 * self.reward_multiplier) as u128

    }

    pub fn distribute_reward(&mut self, user: String) {

        let reward = self.calculate_reward(&user);

        if self.treasury_balance >= reward {

            self.treasury_balance -= reward;

            let entry = self.reward_balances.entry(user).or_insert(0);
            *entry += reward;

        }

    }

    pub fn set_multiplier(&mut self, value: f64) {

        if value >= 0.5 && value <= 3.0 {
            self.reward_multiplier = value;
        }

    }

}
