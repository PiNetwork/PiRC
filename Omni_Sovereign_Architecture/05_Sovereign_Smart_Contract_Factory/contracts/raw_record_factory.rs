#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, Address, Env, String, Map, symbol_short};
#[contract] pub struct RawRecordFactory;
#[contractimpl]
impl RawRecordFactory {
  pub fn register_and_deploy(env: Env, product_id: String, _metadata: Map<String, String>, owner: Address) -> String {
    env.events().publish((symbol_short!("FACTORY"), symbol_short!("DEPLOYED")), (product_id.clone(), owner));
    product_id
  }
}
