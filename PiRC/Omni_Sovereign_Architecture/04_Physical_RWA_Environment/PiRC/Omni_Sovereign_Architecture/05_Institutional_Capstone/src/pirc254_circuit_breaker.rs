#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};
#[contract]
pub struct CapstoneSafety;
#[contractimpl]
impl CapstoneSafety {
    pub fn emergency_halt(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&Symbol::short("HALT"), &true);
    }
}
