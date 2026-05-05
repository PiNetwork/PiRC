use soroban_sdk::{contractimpl, Address, Env, Symbol, Vec, Map};

pub struct PiToken;

#[contractimpl]
impl PiToken {
    // Mint token on demand
    pub fn mint(env: Env, to: Address, amount: u64) {
        let key = (b"balance", to.clone());
        let mut bal: u64 = env.storage().get(&key).unwrap_or(0);
        bal += amount;
        env.storage().set(&key, &bal);
    }

    // Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: u64) -> bool {
        let from_key = (b"balance", from.clone());
        let mut from_bal: u64 = env.storage().get(&from_key).unwrap_or(0);
        if from_bal < amount { return false; }
        from_bal -= amount;
        env.storage().set(&from_key, &from_bal);

        let to_key = (b"balance", to.clone());
        let mut to_bal: u64 = env.storage().get(&to_key).unwrap_or(0);
        to_bal += amount;
        env.storage().set(&to_key, &to_bal);
        true
    }

    // Check balance
    pub fn balance_of(env: Env, addr: Address) -> u64 {
        env.storage().get(&(b"balance", addr)).unwrap_or(0)
    }
}
