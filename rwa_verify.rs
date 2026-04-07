#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    Env, Bytes, BytesN, Symbol, Vec,
};

#[contract]
pub struct RWAContract;

#[contracttype]
#[derive(Clone)]
pub struct RwaMetadata {
    pub pid: BytesN<32>,          // hash product id
    pub issuer_pubkey: BytesN<32>,// ed25519 public key
    pub signature: Bytes,         // signature
    pub chip_uid: Bytes,          // optional NFC
}

#[contracttype]
#[derive(Clone)]
pub struct VerificationResult {
    pub valid: bool,
    pub confidence: u32,
}

#[contractimpl]
impl RWAContract {

    // Core verification function
    pub fn verify(env: Env, data: RwaMetadata) -> VerificationResult {

        // Step 1: Verify signature
        let is_valid_sig = env.crypto().ed25519_verify(
            &data.issuer_pubkey,
            &data.pid.into(),
            &data.signature,
        );

        // Step 2: NFC binding check (optional)
        let mut confidence: u32 = 0;

        if is_valid_sig {
            confidence += 70;
        }

        if data.chip_uid.len() > 0 {
            confidence += 30;
        }

        VerificationResult {
            valid: is_valid_sig,
            confidence: confidence,
        }
    }

    // Helper: register product (optional)
    pub fn register(env: Env, pid: BytesN<32>) {
        let key = Symbol::short("PID");
        env.storage().instance().set(&key, &pid);
    }
}
