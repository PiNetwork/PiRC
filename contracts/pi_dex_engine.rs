mod pirc_config;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Pool {
    pub token: String,
    pub pi_reserve: f64,
    pub token_reserve: f64,
    pub fee_rate: f64
}

pub struct PiDexEngine {
    pools: HashMap<String, Pool>
}

impl PiDexEngine {

    pub fn new() -> Self {
        Self {
            pools: HashMap::new()
        }
    }

    pub fn create_pool(
        &mut self,
        token: String,
        pi: f64,
        token_amount: f64,
        fee_rate: f64
    ) {

        let pool = Pool {
            token: token.clone(),
            pi_reserve: pi,
            token_reserve: token_amount,
            fee_rate
        };

        self.pools.insert(token, pool);
    }

    pub fn price(&self, token: &String) -> Option<f64> {

        self.pools.get(token).map(|p| {
            p.pi_reserve / p.token_reserve
        })
    }

    pub fn swap_pi_for_token(
        &mut self,
        token: &String,
        pi_input: f64
    ) -> Option<f64> {

        let pool = self.pools.get_mut(token)?;

        let fee = pi_input * pool.fee_rate;
        let input = pi_input - fee;

        let k = pool.pi_reserve * pool.token_reserve;

        pool.pi_reserve += input;

        let new_token_reserve = k / pool.pi_reserve;

        let tokens_out = pool.token_reserve - new_token_reserve;

        pool.token_reserve = new_token_reserve;

        Some(tokens_out)
    }

    pub fn swap_token_for_pi(
        &mut self,
        token: &String,
        token_input: f64
    ) -> Option<f64> {

        let pool = self.pools.get_mut(token)?;

        let fee = token_input * pool.fee_rate;
        let input = token_input - fee;

        let k = pool.pi_reserve * pool.token_reserve;

        pool.token_reserve += input;

        let new_pi_reserve = k / pool.token_reserve;

        let pi_out = pool.pi_reserve - new_pi_reserve;

        pool.pi_reserve = new_pi_reserve;

        Some(pi_out)
    }

    pub fn pool_state(&self, token: &String) -> Option<&Pool> {
        self.pools.get(token)
    }
}
