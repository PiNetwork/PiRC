use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC253GrantDistribution;

#[contractimpl]
impl PiRC253GrantDistribution {
    pub fn unlock_milestone(env: Env, oracle: Address, grant_id: u32, amount: U256) {
        oracle.require_auth();
        env.events().publish((symbol_short!("Grant"), symbol_short!("Unlocked")), (grant_id, amount));
    }
}
