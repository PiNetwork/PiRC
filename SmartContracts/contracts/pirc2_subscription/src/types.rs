#![no_std]
use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Service {
    pub service_id: u64,
    pub merchant: Address,
    pub name: String,
    pub price: i128,
    pub period_secs: u64,
    pub trial_period_secs: u64,
    pub approve_periods: u64,
    pub is_active: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Subscription {
    pub sub_id: u64,
    pub subscriber: Address,
    pub service_id: u64,
    pub price: i128,
    pub period_secs: u64,
    pub trial_period_secs: u64,
    pub trial_end_ts: u64,
    pub auto_renew: bool,
    pub service_end_ts: u64,
    pub next_charge_ts: u64,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProcessResult {
    pub charged: u32,
    pub failed: u32,
    pub skipped: u32,
    pub total: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    NextServiceId,
    NextSubId,
    Service(u64),
    MerchantServices(Address),
    Sub(u64),
    SubscriberSubs(Address),
    ServiceSubs(u64),
    SubServicePair(Address, u64),
}
