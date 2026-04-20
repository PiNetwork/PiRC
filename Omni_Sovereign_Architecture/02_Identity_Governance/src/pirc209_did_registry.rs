#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, BytesN};
#[contract]
pub struct DecentralizedIdentity;
#[contractimpl]
impl DecentralizedIdentity {
    pub fn verify_kyc_hash(env: Env, user: Address, zk_proof: BytesN<32>) -> bool {
        user.require_auth();
        env.storage().instance().set(&("DID", user), &zk_proof);
        true
    }
}
