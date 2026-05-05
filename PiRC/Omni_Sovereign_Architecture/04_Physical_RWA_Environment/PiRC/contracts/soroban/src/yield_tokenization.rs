use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U128};

#[contract]
pub struct PiRC235YieldTokenization;

#[contractimpl]
impl PiRC235YieldTokenization {
    pub fn tokenize(env: Env, user: Address, amount: U128) {
        user.require_auth();
        env.events().publish((symbol_short!("YieldTok"), symbol_short!("Split")), (user, amount));
    }
}
