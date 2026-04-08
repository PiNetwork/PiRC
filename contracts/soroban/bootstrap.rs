#![no_std]
use soroban_sdk::{contractimpl, Env};

pub struct Bootstrapper;

#[contractimpl]
impl Bootstrapper {
    pub fn run(env: Env) {
        let liquidity_amount = env.invoke_contract::<u128>(&Symbol::short("LiquidityController"), &Symbol::short("execute_liquidity"), &());
        env.invoke_contract::<u128>(&Symbol::short("FreeFaultDex"), &Symbol::short("add_liquidity"), &(liquidity_amount, liquidity_amount));
        // distribute rewards proportional
        env.invoke_contract::<()>("RewardEngine", &Symbol::short("distribute"), &(env.invoker(), liquidity_amount / 10));
    }
}
