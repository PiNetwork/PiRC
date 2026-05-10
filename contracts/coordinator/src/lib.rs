#![no_std]
use soroban_sdk::{contract, contractimpl, Symbol, Address, Env};
use shared::ModuleAddresses;

const MODULES: Symbol = Symbol::new(&[], "modules");
const ADMIN: Symbol = Symbol::new(&[], "admin");
const PAUSED: Symbol = Symbol::new(&[], "paused");

#[contract]
pub struct CoordinatorContract;

#[contractimpl]
impl CoordinatorContract {
    pub fn initialize(env: Env, admin: Address, modules: ModuleAddresses) {
        admin.require_auth();
        env.storage().persistent().set(&ADMIN, &admin);
        env.storage().persistent().set(&MODULES, &modules);
        env.storage().persistent().set(&PAUSED, &false);
    }

    pub fn set_modules(env: Env, admin: Address, modules: ModuleAddresses) {
        admin.require_auth();
        env.storage().persistent().set(&MODULES, &modules);
    }

    pub fn pause(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().persistent().set(&PAUSED, &true);
    }

    pub fn unpause(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().persistent().set(&PAUSED, &false);
    }

    pub fn is_paused(env: Env) -> bool { env.storage().persistent().get(&PAUSED).unwrap_or(false) }
    pub fn get_modules(env: Env) -> ModuleAddresses { env.storage().persistent().get(&MODULES).unwrap() }
}
