#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub struct Service {
    pub service_id: u64,
    pub merchant: Address,
    pub name: String,
    pub price: i128,
    pub period_secs: u64,
    pub is_active: bool,
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    pub fn register_service(env: Env, merchant: Address, name: String, price: i128, period_secs: u64) -> Service {
        merchant.require_auth();
        Service {
            service_id: 1,
            merchant,
            name,
            price,
            period_secs,
            is_active: true,
        }
    }
    
    pub fn subscribe(env: Env, subscriber: Address, service_id: u64, auto_renew: bool) -> bool {
        subscriber.require_auth();
        true
    }
}
