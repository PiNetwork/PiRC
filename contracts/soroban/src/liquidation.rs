use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct PiRC232Liquidation;

#[contractimpl]
impl PiRC232Liquidation {
    pub fn liquidate(env: Env, liquidator: Address, user: Address) {
        liquidator.require_auth();
        env.events().publish((symbol_short!("Liquidate"), symbol_short!("Exec")), (liquidator, user));
    }
}
