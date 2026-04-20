#![no_std]
use soroban_sdk::{contracttype, Address, String};

/// Official PiRC-2 Data Types Implementation
#[contracttype]
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
pub struct Subscription {
    pub sub_id: u64,
    pub subscriber: Address,
    pub service_id: u64,
    pub price: i128,
    pub pay_upfront: bool,        
    pub service_end_ts: u64,
    pub next_charge_ts: u64,
}

/// Official PiRC-2 Error Codes
#[repr(u32)]
pub enum Pirc2Error {
    InvalidPrice = 1,
    InvalidPeriod = 2,
    AlreadySubscribed = 3,
    SubscriptionNotFound = 4,
    ServiceNotFound = 5,
    Unauthorized = 6,
    AlreadyCancelled = 7,
    TimestampOverflow = 8,
    NotServiceOwner = 9,
    InvalidServiceName = 10,
    SubscriptionExpired = 11,
}
