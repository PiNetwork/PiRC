mod pirc_config;
pub struct RewardEngineEnhanced;

impl RewardEngineEnhanced {
    pub fn allocate_rewards(total_vault: u64, active_ratio: f64) -> u64 {
        let base = total_vault.saturating_mul(314) / 10_000;
        let boosted = (base as f64 * (1.0 + active_ratio.clamp(0.0, 1.0))) as u64;
        boosted
    }
}
