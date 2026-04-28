#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, Address, Env};
#[contract]
pub struct PiRC103Contract;
#[contractimpl]
impl PiRC103Contract {
    pub fn invoke_layer(env: Env, caller: Address) -> bool {
        caller.require_auth();
        true
    }
}
