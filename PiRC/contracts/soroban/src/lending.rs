use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U128};

#[contract]
pub struct PiRC231Lending;

#[contractimpl]
impl PiRC231Lending {
    pub fn deposit(env: Env, user: Address, amount: U128) {
        user.require_auth();
        env.events().publish((symbol_short!("Lending"), symbol_short!("Deposit")), (user, amount));
    }

    pub fn borrow(env: Env, user: Address, amount: U128) {
        user.require_auth();
        env.events().publish((symbol_short!("Lending"), symbol_short!("Borrow")), (user, amount));
    }
}
