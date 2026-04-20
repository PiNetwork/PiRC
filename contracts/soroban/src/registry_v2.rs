use soroban_sdk::{contract, contractimpl, Env, symbol_short};

#[contract]
pub struct PiRC230RegistryV2;

#[contractimpl]
impl PiRC230RegistryV2 {
    pub fn trigger_circuit_breaker(env: Env) {
        env.storage().instance().set(&"circuit_breaker", &true);
        env.events().publish((symbol_short!("PARITY"), symbol_short!("HALTED")), true);
    }

    pub fn is_parity_safe(env: Env) -> bool {
        let breaker: bool = env.storage().instance().get(&"circuit_breaker").unwrap_or(false);
        if breaker {
            return false;
        }
        
        let reserve: i128 = env.storage().instance().get(&"total_reserve").unwrap_or(0);
        let supply: i128 = env.storage().instance().get(&"total_supply").unwrap_or(0);
        
        supply <= reserve
    }
}

