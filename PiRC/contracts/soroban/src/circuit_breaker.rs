use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct PiRC254CircuitBreaker;

#[contractimpl]
impl PiRC254CircuitBreaker {
    pub fn trigger_pause(env: Env, admin: Address) {
        admin.require_auth();
        env.events().publish((symbol_short!("Circuit"), symbol_short!("Paused")), ());
    }

    pub fn lift_pause(env: Env, admin: Address) {
        admin.require_auth();
        env.events().publish((symbol_short!("Circuit"), symbol_short!("Resumed")), ());
    }
}
