mod pirc_config;
#[derive(Debug)]
pub struct ProjectMetrics {

    pub product_ready: f64,
    pub token_utility: f64,
    pub user_acquisition: f64,
    pub liquidity_plan: f64

}

pub struct LaunchpadEvaluator;

impl LaunchpadEvaluator {

    pub fn evaluate(metrics: ProjectMetrics) -> f64 {

        metrics.product_ready * 0.35
        + metrics.token_utility * 0.30
        + metrics.user_acquisition * 0.20
        + metrics.liquidity_plan * 0.15
    }

    pub fn approved(score: f64) -> bool {

        score > 0.7

    }
}
