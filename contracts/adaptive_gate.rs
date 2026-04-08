use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[contract]
pub struct AdaptiveUtilityGate;

#[contractimpl]
impl AdaptiveUtilityGate {
    pub fn check_and_unlock(env: Env, pioneer: Address, score: u64) -> bool {
        let threshold_key = Symbol::new(&env, "THRESHOLD");
        let phi_key = Symbol::new(&env, "PHI");

        let threshold: u64 = env.storage().instance().get(&threshold_key).unwrap_or(5000);
        let phi_guard: u64 = env.storage().instance().get(&phi_key).unwrap_or(95);

        if score >= threshold && phi_guard < 100 {
            env.events()
                .publish((Symbol::new(&env, "UTILITY_UNLOCKED"), pioneer), score);
            true
        } else {
            false
        }
    }

    pub fn update_threshold(env: Env, new_threshold: u64) {
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "THRESHOLD"), &new_threshold);
    }

    pub fn update_phi_guard(env: Env, phi_guard: u64) {
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "PHI"), &phi_guard);
    }
}
