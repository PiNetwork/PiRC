#![no_std]
use soroban_sdk::{contract, contractimpl, Symbol, Address, BytesN, Env};
use shared::{VerificationLevel, VerificationStatus, MerchantCategory, MerchantProfile};

#[cfg(test)]
mod test;

fn merchant_key(_env: &Env, _addr: &Address) -> Symbol { Symbol::new(&[], "merchant") }

#[contract]
pub struct MerchantContract;

#[contractimpl]
impl MerchantContract {
    pub fn apply_verification(env: Env, merchant: Address, business_name_hash: BytesN<32>, category: MerchantCategory, jurisdiction: BytesN<2>, metadata_uri: BytesN<32>) {
        merchant.require_auth();
        let p = MerchantProfile {
            merchant: merchant.clone(), level: VerificationLevel::None, business_name_hash, category,
            status: VerificationStatus::Pending, jurisdiction, total_volume: 0, total_orders: 0,
            avg_rating: 0, verified_at: None, expires_at: None, location_count: 0, metadata_uri,
        };
        env.storage().persistent().set(&merchant_key(&env, &merchant), &p);
        env.events().publish((Symbol::new(&[], "merchant_applied"), merchant), category);
    }

    pub fn approve_verification(env: Env, _caller: Address, merchant: Address, level: VerificationLevel) {
        let mut p: MerchantProfile = env.storage().persistent().get(&merchant_key(&env, &merchant)).unwrap();
        p.level = level; p.status = VerificationStatus::Approved;
        p.verified_at = Some(env.ledger().timestamp());
        p.expires_at = Some(env.ledger().timestamp() + 31536000);
        env.storage().persistent().set(&merchant_key(&env, &merchant), &p);
        env.events().publish((Symbol::new(&[], "merchant_approved"), merchant), level);
    }

    pub fn suspend_merchant(env: Env, _caller: Address, merchant: Address, _reason_hash: BytesN<32>) {
        let mut p: MerchantProfile = env.storage().persistent().get(&merchant_key(&env, &merchant)).unwrap();
        p.status = VerificationStatus::Suspended;
        env.storage().persistent().set(&merchant_key(&env, &merchant), &p);
    }

    pub fn revoke_verification(env: Env, _caller: Address, merchant: Address, _reason_hash: BytesN<32>) {
        let mut p: MerchantProfile = env.storage().persistent().get(&merchant_key(&env, &merchant)).unwrap();
        p.status = VerificationStatus::Revoked;
        env.storage().persistent().set(&merchant_key(&env, &merchant), &p);
    }

    pub fn get_merchant(env: Env, merchant: Address) -> MerchantProfile {
        env.storage().persistent().get(&merchant_key(&env, &merchant)).unwrap()
    }
}
