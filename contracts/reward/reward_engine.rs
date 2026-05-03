 core/reward-logic

mod pirc_config;
 main
pub struct RewardEngine;

impl RewardEngine {

    pub fn calculate_reward(activity_score: u128, liquidity_score: u128) -> u128 {

        let base_reward = 10;

        activity_score * base_reward + liquidity_score * 5
    }

}
