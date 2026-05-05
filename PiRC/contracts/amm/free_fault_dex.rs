mod pirc_config;
#![no_std]
use soroban_sdk::{
    contractimpl, symbol, Address, Env, Symbol, Vec,
};

#[derive(Clone)]
pub struct FreeFaultDex;

#[contractimpl]
impl FreeFaultDex {

    /// AMM pool state
    /// reserves: (token_amount, pi_amount)
    pub fn init_pool(env: Env, token_amount: u128, pi_amount: u128) {
        env.storage().set(&symbol!("reserves"), &(token_amount, pi_amount));
        env.storage().set(&symbol!("total_liquidity"), &0u128);
    }

    /// Add liquidity safely
    pub fn add_liquidity(env: Env, token_amount: u128, pi_amount: u128) -> Result<(u128, u128, u128), &'static str> {
        if token_amount == 0 || pi_amount == 0 {
            return Err("INVALID_AMOUNTS");
        }

        let (token_reserve, pi_reserve): (u128, u128) = env.storage().get(&symbol!("reserves")).unwrap_or((0, 0));
        let mut total_liq: u128 = env.storage().get(&symbol!("total_liquidity")).unwrap_or(0);

        // Calculate liquidity shares
        let liquidity_minted = if total_liq == 0 {
            // initial liquidity
            (token_amount * pi_amount).integer_sqrt()
        } else {
            let liquidity_token = token_amount * total_liq / token_reserve;
            let liquidity_pi = pi_amount * total_liq / pi_reserve;
            if liquidity_token < liquidity_pi { liquidity_token } else { liquidity_pi }
        };

        // Update pool
        env.storage().set(&symbol!("reserves"), &(token_reserve.checked_add(token_amount).ok_or("OVERFLOW_TOKEN")?, 
                                                  pi_reserve.checked_add(pi_amount).ok_or("OVERFLOW_PI")?));
        total_liq = total_liq.checked_add(liquidity_minted).ok_or("OVERFLOW_LIQ")?;
        env.storage().set(&symbol!("total_liquidity"), &total_liq);

        env.events().publish((symbol!("AddLiquidity"),), (token_amount, pi_amount, liquidity_minted));

        Ok((token_amount, pi_amount, liquidity_minted))
    }

    /// Swap token → pi
    pub fn swap_token_for_pi(env: Env, token_in: u128) -> Result<u128, &'static str> {
        let (token_reserve, pi_reserve): (u128, u128) = env.storage().get(&symbol!("reserves")).unwrap_or((0, 0));
        if token_in == 0 || token_reserve == 0 || pi_reserve == 0 {
            return Err("INVALID_SWAP");
        }

        // x*y=k formula
        let token_reserve_new = token_reserve.checked_add(token_in).ok_or("OVERFLOW_TOKEN")?;
        let k = token_reserve.checked_mul(pi_reserve).ok_or("OVERFLOW_K")?;
        let pi_out = pi_reserve.checked_sub(k.checked_div(token_reserve_new).ok_or("DIV_BY_ZERO")?).ok_or("UNDERFLOW_PI")?;

        env.storage().set(&symbol!("reserves"), &(token_reserve_new, pi_reserve.checked_sub(pi_out).ok_or("UNDERFLOW_PI2")?));
        env.events().publish((symbol!("SwapTokenForPi"),), (token_in, pi_out));
        Ok(pi_out)
    }

    /// Swap pi → token
    pub fn swap_pi_for_token(env: Env, pi_in: u128) -> Result<u128, &'static str> {
        let (token_reserve, pi_reserve): (u128, u128) = env.storage().get(&symbol!("reserves")).unwrap_or((0, 0));
        if pi_in == 0 || token_reserve == 0 || pi_reserve == 0 {
            return Err("INVALID_SWAP");
        }

        let pi_reserve_new = pi_reserve.checked_add(pi_in).ok_or("OVERFLOW_PI")?;
        let k = token_reserve.checked_mul(pi_reserve).ok_or("OVERFLOW_K")?;
        let token_out = token_reserve.checked_sub(k.checked_div(pi_reserve_new).ok_or("DIV_BY_ZERO")?).ok_or("UNDERFLOW_TOKEN")?;

        env.storage().set(&symbol!("reserves"), &(token_reserve.checked_sub(token_out).ok_or("UNDERFLOW_TOKEN2")?, pi_reserve_new));
        env.events().publish((symbol!("SwapPiForToken"),), (pi_in, token_out));
        Ok(token_out)
    }

    /// Query pool
    pub fn get_reserves(env: Env) -> (u128, u128) {
        env.storage().get(&symbol!("reserves")).unwrap_or((0, 0))
    }

    /// Total liquidity
    pub fn total_liquidity(env: Env) -> u128 {
        env.storage().get(&symbol!("total_liquidity")).unwrap_or(0)
    }
}

// Integer square root helper
trait IntegerSqrt {
    fn integer_sqrt(self) -> Self;
}

impl IntegerSqrt for u128 {
    fn integer_sqrt(self) -> Self {
        let mut x0 = self / 2;
        let mut x1 = (x0 + self / x0) / 2;
        while x1 < x0 {
            x0 = x1;
            x1 = (x0 + self / x0) / 2;
        }
        x0
    }
}
