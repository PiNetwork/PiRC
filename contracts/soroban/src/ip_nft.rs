#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Map};

#[contract]
pub struct PiRC222IPNFT;

#[contractimpl]
impl PiRC222IPNFT {
    pub fn mint_ip(env: Env, owner: Address, ip_uri: String) -> u32 {
        owner.require_auth();
        let mut last_id: u32 = env.storage().instance().get(&"last_id").unwrap_or(0);
        last_id += 1;
        
        env.storage().instance().set(&last_id, &owner);
        env.storage().instance().set(&"last_id", &last_id);
        
        env.storage().persistent().set(&(symbol_short!("uri"), last_id), &ip_uri);
        
        last_id
    }
}

