#![no_std]
mod types;
mod errors;

use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, String, Vec};
use types::{DataKey, ProcessResult, Service, Subscription};
use errors::ContractError;

#[contract]
pub struct PiRC2SubscriptionContract;

#[contractimpl]
impl PiRC2SubscriptionContract {
    
    pub fn __constructor(env: Env, admin: Address, token: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::NextServiceId, &0u64);
        env.storage().instance().set(&DataKey::NextSubId, &0u64);
    }

    pub fn register_service(
        env: Env,
        merchant: Address,
        name: String,
        price: i128,
        period_secs: u64,
        trial_period_secs: u64,
        approve_periods: u64,
    ) -> Result<Service, ContractError> {
        merchant.require_auth();

        if price <= 0 { return Err(ContractError::InvalidPrice); }
        if period_secs == 0 || approve_periods == 0 { return Err(ContractError::InvalidPeriod); }
        if name.len() == 0 { return Err(ContractError::InvalidServiceName); }

        let service_id: u64 = env.storage().instance().get(&DataKey::NextServiceId).unwrap_or(0);
        env.storage().instance().set(&DataKey::NextServiceId, &(service_id + 1));

        let service = Service {
            service_id,
            merchant: merchant.clone(),
            name,
            price,
            period_secs,
            trial_period_secs,
            approve_periods,
            is_active: true,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Service(service_id), &service);
        env.events().publish((soroban_sdk::Symbol::short("srv_reg"),), service.clone());

        Ok(service)
    }

    pub fn subscribe(
        env: Env,
        subscriber: Address,
        service_id: u64,
        auto_renew: bool,
    ) -> Result<Subscription, ContractError> {
        subscriber.require_auth();
        
        let service: Service = env.storage().persistent().get(&DataKey::Service(service_id))
            .ok_or(ContractError::ServiceNotFound)?;
        
        if !service.is_active { return Err(ContractError::ServiceNotActive); }

        let sub_id: u64 = env.storage().instance().get(&DataKey::NextSubId).unwrap_or(0);
        env.storage().instance().set(&DataKey::NextSubId, &(sub_id + 1));

        let current_ts = env.ledger().timestamp();
        let trial_end_ts = current_ts + service.trial_period_secs;
        
        let sub = Subscription {
            sub_id,
            subscriber: subscriber.clone(),
            service_id,
            price: service.price,
            period_secs: service.period_secs,
            trial_period_secs: service.trial_period_secs,
            trial_end_ts,
            auto_renew,
            service_end_ts: trial_end_ts + service.period_secs,
            next_charge_ts: trial_end_ts,
            created_at: current_ts,
        };

        env.storage().persistent().set(&DataKey::Sub(sub_id), &sub);
        env.events().publish((soroban_sdk::Symbol::short("sub"),), (subscriber, service_id, sub_id));

        Ok(sub)
    }

    pub fn process(
        env: Env,
        merchant: Address,
        service_id: u64,
        offset: u32,
        limit: u32,
    ) -> Result<ProcessResult, ContractError> {
        merchant.require_auth();
        env.events().publish((soroban_sdk::Symbol::short("process"),), (merchant, service_id));
        Ok(ProcessResult { charged: 0, failed: 0, skipped: 0, total: 0 })
    }
}
