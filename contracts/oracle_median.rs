mod pirc_config;
use soroban_sdk::{contract, contractimpl, Env, Vec};

#[contract]
pub struct MerchantOracle;

#[contractimpl]
impl MerchantOracle {
    pub fn get_stable_price(env: Env, p_kraken: u64, p_kucoin: u64, p_binance: u64) -> u64 {
        let mut prices: Vec<u64> = Vec::new(&env);
        prices.push_back(p_kraken);
        prices.push_back(p_kucoin);
        prices.push_back(p_binance);

        prices.sort();
        let median = prices.get(1).unwrap_or(0);

        let phi_bps: u64 = 9500;
        median * phi_bps / 10_000
    }
}
