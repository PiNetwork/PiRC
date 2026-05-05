use soroban_sdk::{contractimpl, Env, Address};

pub struct LiquidityBootstrapper;

#[contractimpl]
impl LiquidityBootstrapper {
    pub fn bootstrap(env: Env, controller: Address, executor_a: Address, executor_b: Address, token_amount: u64, pi_amount: u64) {
        env.invoke_contract::<()>(
            &controller,
            &soroban_sdk::Symbol::new(&env, "execute_liquidity"),
            &(executor_a.clone(), token_amount/2, pi_amount/2)
        );
        env.invoke_contract::<()>(
            &controller,
            &soroban_sdk::Symbol::new(&env, "execute_liquidity"),
            &(executor_b.clone(), token_amount/2, pi_amount/2)
        );
    }
}
