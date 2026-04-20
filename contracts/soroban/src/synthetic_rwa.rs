use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, U128};

#[contract]
pub struct PiRC234SyntheticRWA;

#[contractimpl]
impl PiRC234SyntheticRWA {
    pub fn mint_synthetic(env: Env, user: Address, asset: String, amount: U128) {
        user.require_auth();
        env.events().publish((symbol_short!("SynthRWA"), symbol_short!("Minted")), (user, asset, amount));
    }
}
