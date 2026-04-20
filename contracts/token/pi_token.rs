mod pirc_config;
 rwa-conceptual-auth-extension
use soroban_sdk::{Env, Address, Map, symbol_short};

pub struct PiToken;

const BALANCES: Map<Address, i128> = Map::new();

impl PiToken {

    pub fn mint(env: Env, to: Address, amount: i128) {
        let mut balance = Self::balance_of(env.clone(), to.clone());
        balance += amount;

        env.storage().persistent().set(&to, &balance);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        let mut balance = Self::balance_of(env.clone(), from.clone());
        balance -= amount;

        env.storage().persistent().set(&from, &balance);
    }

    pub fn balance_of(env: Env, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&user)
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&symbol_short!("TOTAL"))
            .unwrap_or(0)
    }

pub struct PiToken {
    pub total_supply: u128,
}

impl PiToken {

    pub fn new() -> Self {
        Self {
            total_supply: 0,
        }
    }

    pub fn mint(&mut self, amount: u128) {
        self.total_supply += amount;
    }

    pub fn burn(&mut self, amount: u128) {
        self.total_supply -= amount;
    }

    pub fn total_supply(&self) -> u128 {
        self.total_supply
    }

 Backup-copy
}
