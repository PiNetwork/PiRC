#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
mod pirc_config;
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec, Map};

#[contract]
pub struct SovereignRegistry;

#[contractimpl]
impl SovereignRegistry {
    // Registers a new product to the global ledger
    pub fn register_product(env: Env, product_id: Symbol, contract_address: Address, owner: Address) {
        // Ensure only authorized factory can call this (simplified for now)
        owner.require_auth();

        let mut registry = env.storage().persistent().get::<Symbol, Map<Symbol, Address>>(&symbol_short!("REG")).unwrap_or(Map::new(&env));
        
        registry.set(product_id.clone(), contract_address);
        
        env.storage().persistent().set(&symbol_short!("REG"), &registry);
        
        env.events().publish((symbol_short!("REG_LOG"), product_id), contract_address);
    }

    // Fetches a contract address for a specific Product ID
    pub fn get_product(env: Env, product_id: Symbol) -> Option<Address> {
        let registry = env.storage().persistent().get::<Symbol, Map<Symbol, Address>>(&symbol_short!("REG")).unwrap_or(Map::new(&env));
        registry.get(product_id)
    }
}
