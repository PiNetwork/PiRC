use std::collections::HashMap;

#[derive(Debug)]
pub struct LiquidityPool {
    pub token: String,
    pub pi_reserve: f64,
    pub token_reserve: f64,
}

pub struct LiquidityBootstrapEngine {

    pools: HashMap<String, LiquidityPool>

}

impl LiquidityBootstrapEngine {

    pub fn new() -> Self {
        Self {
            pools: HashMap::new()
        }
    }

    pub fn create_pool(
        &mut self,
        token: String,
        pi_amount: f64,
        token_amount: f64
    ) {

        let pool = LiquidityPool {
            token: token.clone(),
            pi_reserve: pi_amount,
            token_reserve: token_amount
        };

        self.pools.insert(token, pool);
    }

    pub fn price(&self, token: &String) -> Option<f64> {

        self.pools.get(token).map(|pool| {
            pool.pi_reserve / pool.token_reserve
        })
    }

    pub fn swap_pi_for_token(
        &mut self,
        token: &String,
        pi_amount: f64
    ) -> Option<f64> {

        let pool = self.pools.get_mut(token)?;

        let k = pool.pi_reserve * pool.token_reserve;

        pool.pi_reserve += pi_amount;

        pool.token_reserve = k / pool.pi_reserve;

        Some(pool.token_reserve)
    }
}
