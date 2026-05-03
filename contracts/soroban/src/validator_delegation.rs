use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, U256};

#[contract]
pub struct PiRC256ValidatorDelegation;

#[contractimpl]
impl PiRC256ValidatorDelegation {
    pub fn delegate(env: Env, delegator: Address, validator: Address, amount: U256) {
        delegator.require_auth();
        env.events().publish((symbol_short!("Delegate"), symbol_short!("Added")), (validator, amount));
    }
}
