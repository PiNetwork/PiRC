use soroban_sdk::{contract, contractimpl, Address, Env, symbol_short};

#[contract]
pub struct PiRC226Fractionalizer;

#[contractimpl]
impl PiRC226Fractionalizer {
    pub fn create_shares(env: Env, nft_id: u32, total_supply: i128) {
        env.storage().instance().set(&(symbol_short!("shares"), nft_id), &total_supply);
    }
}

