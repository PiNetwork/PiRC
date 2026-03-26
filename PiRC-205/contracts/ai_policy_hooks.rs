pub struct AIPolicyHooks;

impl AIPolicyHooks {
    pub fn clip_ippr(next_ippr: f64, min_ippr: f64, max_ippr: f64) -> f64 {
        next_ippr.clamp(min_ippr, max_ippr)
    }
}
