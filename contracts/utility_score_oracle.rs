use std::collections::HashMap;

#[derive(Debug)]
pub struct UtilityMetrics {
    pub tx_volume: f64,
    pub active_users: f64,
    pub product_usage: f64,
}

pub struct UtilityScoreOracle {
    scores: HashMap<String, f64>,
}

impl UtilityScoreOracle {

    pub fn new() -> Self {
        Self {
            scores: HashMap::new()
        }
    }

    pub fn compute_score(metrics: &UtilityMetrics) -> f64 {

        let score =
            metrics.tx_volume * 0.4 +
            metrics.active_users * 0.3 +
            metrics.product_usage * 0.3;

        score
    }

    pub fn update_score(&mut self, app_id: String, metrics: UtilityMetrics) {

        let score = Self::compute_score(&metrics);

        self.scores.insert(app_id, score);
    }

    pub fn get_score(&self, app_id: &String) -> Option<&f64> {
        self.scores.get(app_id)
    }
}
