use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC252TreasuryDiversification;

#[contractimpl]
impl PiRC252TreasuryDiversification {
    pub fn execute_swap(env: Env, admin: Address, token_sold: Address, token_bought: Address, amount: U256) {
        admin.require_auth();
        env.events().publish((symbol_short!("Treasury"), symbol_short!("Swap")), (token_sold, token_bought, amount));
    }
}
