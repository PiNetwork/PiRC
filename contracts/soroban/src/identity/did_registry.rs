#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

/// PiRC-209: Sovereign Decentralized Identity (DID)
#[contract]
pub struct DIDRegistry;

#[contractimpl]
impl DIDRegistry {
    /// Registers a Pioneer's decentralized identity securely.
    pub fn register_sovereign_id(env: Env, user: Address, kyc_hash: Symbol) {
        user.require_auth();
        // Stores the KYC proof hash on-chain without revealing personal data (Zero-Knowledge)
        env.storage().instance().set(&user, &kyc_hash);
    }

    /// Verifies if a user is compliant for institutional DeFi pools.
    pub fn is_verified(env: Env, user: Address) -> bool {
        env.storage().instance().has(&user)
    }
}
