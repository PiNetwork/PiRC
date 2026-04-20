#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    Address, Env, String, Vec, Map, Symbol, symbol_short,
    token, IntoVal, TryFromVal, BytesN,
};

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
    pub pay_upfront: bool,
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
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
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

const ADMIN: Symbol = symbol_short!("admin");
const TOKEN: Symbol = symbol_short!("token");
const SERVICE_COUNTER: Symbol = symbol_short!("svc_cnt");
const SUB_COUNTER: Symbol = symbol_short!("sub_cnt");
const SERVICES: Symbol = symbol_short!("services");
const SUBSCRIPTIONS: Symbol = symbol_short!("subs");

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    pub fn __constructor(env: Env, admin: Address, token: Address) {
        admin.require_auth();
        env.storage().persistent().set(&ADMIN, &admin);
        env.storage().persistent().set(&TOKEN, &token);
        env.storage().persistent().set(&SERVICE_COUNTER, &0u64);
        env.storage().persistent().set(&SUB_COUNTER, &0u64);
    }

    pub fn register_service(
        env: Env,
        merchant: Address,
        name: String,
        price: i128,
        period_secs: u64,
        trial_period_secs: u64,
        approve_periods: u64,
    ) -> Service {
        merchant.require_auth();

        if price <= 0 { panic_with_error!(env, Error::InvalidPrice); }
        if period_secs == 0 || approve_periods == 0 { panic_with_error!(env, Error::InvalidPeriod); }
        if name.is_empty() { panic_with_error!(env, Error::InvalidServiceName); }

        let mut counter: u64 = env.storage().persistent().get(&SERVICE_COUNTER).unwrap_or(0);
        counter += 1;

        let service = Service {
            service_id: counter,
            merchant: merchant.clone(),
            name: name.clone(),
            price,
            period_secs,
            trial_period_secs,
            approve_periods,
            is_active: true,
            created_at: env.ledger().timestamp(),
        };

        let mut services: Map<u64, Service> = env.storage().persistent().get(&SERVICES).unwrap_or_else(|| Map::new(&env));
        services.set(counter, service.clone());
        env.storage().persistent().set(&SERVICES, &services);
        env.storage().persistent().set(&SERVICE_COUNTER, &counter);

        env.events().publish((symbol_short!("srv_reg"),), (counter, merchant, price));

        service
    }

    pub fn subscribe(
        env: Env,
        subscriber: Address,
        service_id: u64,
        pay_upfront: bool,
    ) -> Subscription {
        subscriber.require_auth();

        let services: Map<u64, Service> = env.storage().persistent().get(&SERVICES).unwrap_or_else(|| Map::new(&env));
        let service = match services.get(service_id) {
            Some(s) if s.is_active => s,
            _ => panic_with_error!(env, Error::ServiceNotFound),
        };

        let now = env.ledger().timestamp();
        let trial_end = if service.trial_period_secs > 0 { now + service.trial_period_secs } else { 0 };

        let mut counter: u64 = env.storage().persistent().get(&SUB_COUNTER).unwrap_or(0);
        counter += 1;

        let sub = Subscription {
            sub_id: counter,
            subscriber: subscriber.clone(),
            service_id,
            price: service.price,
            period_secs: service.period_secs,
            trial_period_secs: service.trial_period_secs,
            trial_end_ts: trial_end,
            pay_upfront,
            service_end_ts: now + service.period_secs,
            next_charge_ts: now + service.period_secs,
            created_at: now,
        };

        let token_client = token::Client::new(&env, &env.storage().persistent().get(&TOKEN).unwrap());
        let approve_amount = (service.price * service.approve_periods as i128) as i128;

        // First payment if no trial or pay_upfront
        if pay_upfront || service.trial_period_secs == 0 {
            token_client.transfer_from(&subscriber, &env.current_contract_address(), &subscriber, &service.price);
        }

        // Set allowance (720 ledgers buffer)
        token_client.approve(&subscriber, &env.current_contract_address(), &approve_amount, &(env.ledger().timestamp() + 720 * 60));

        let mut subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        subs.set(counter, sub.clone());
        env.storage().persistent().set(&SUBSCRIPTIONS, &subs);
        env.storage().persistent().set(&SUB_COUNTER, &counter);

        env.events().publish((symbol_short!("sub"),), (subscriber, service_id, pay_upfront));

        sub
    }

    pub fn cancel(env: Env, subscriber: Address, sub_id: u64) {
        subscriber.require_auth();
        let mut subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        let mut sub = match subs.get(sub_id) {
            Some(s) => s,
            None => panic_with_error!(env, Error::SubscriptionNotFound),
        };

        if sub.subscriber != subscriber { panic_with_error!(env, Error::Unauthorized); }
        if !sub.pay_upfront { panic_with_error!(env, Error::AlreadyCancelled); }

        sub.pay_upfront = false;
        subs.set(sub_id, sub);
        env.storage().persistent().set(&SUBSCRIPTIONS, &subs);

        env.events().publish((symbol_short!("cancel"),), (sub_id,));
    }

    pub fn toggle_pay_upfront(env: Env, subscriber: Address, sub_id: u64) -> bool {
        subscriber.require_auth();
        let mut subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        let mut sub = match subs.get(sub_id) {
            Some(s) => s,
            None => panic_with_error!(env, Error::SubscriptionNotFound),
        };

        if sub.subscriber != subscriber { panic_with_error!(env, Error::Unauthorized); }

        sub.pay_upfront = !sub.pay_upfront;
        subs.set(sub_id, sub.clone());
        env.storage().persistent().set(&SUBSCRIPTIONS, &subs);

        env.events().publish((symbol_short!("toggle"),), (sub_id, sub.pay_upfront));
        sub.pay_upfront
    }

    pub fn extend_subscription(env: Env, subscriber: Address, sub_id: u64) -> Subscription {
        subscriber.require_auth();
        let mut subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        let mut sub = match subs.get(sub_id) {
            Some(s) => s,
            None => panic_with_error!(env, Error::SubscriptionNotFound),
        };

        if sub.subscriber != subscriber { panic_with_error!(env, Error::Unauthorized); }

        let now = env.ledger().timestamp();
        sub.service_end_ts = now + sub.period_secs;
        sub.next_charge_ts = now + sub.period_secs;

        subs.set(sub_id, sub.clone());
        env.storage().persistent().set(&SUBSCRIPTIONS, &subs);

        env.events().publish((symbol_short!("extend"),), (sub_id, sub.service_end_ts));
        sub
    }

    pub fn process(env: Env, merchant: Address, service_id: u64) -> ProcessResult {
        merchant.require_auth();
        let services: Map<u64, Service> = env.storage().persistent().get(&SERVICES).unwrap_or_else(|| Map::new(&env));
        let service = match services.get(service_id) {
            Some(s) => s,
            None => panic_with_error!(env, Error::ServiceNotFound),
        };
        if service.merchant != merchant { panic_with_error!(env, Error::NotServiceOwner); }

        let mut charged = 0u32;
        let mut failed = 0u32;
        let mut skipped = 0u32;

        let token_client = token::Client::new(&env, &env.storage().persistent().get(&TOKEN).unwrap());
        let now = env.ledger().timestamp();

        let subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        for (sub_id, sub) in subs.iter() {
            if sub.service_id != service_id { continue; }
            if sub.next_charge_ts > now { skipped += 1; continue; }

            match token_client.try_transfer_from(&sub.subscriber, &env.current_contract_address(), &sub.subscriber, &sub.price) {
                Ok(_) => {
                    charged += 1;
                    // Update next charge time (no drift)
                    let mut updated = sub;
                    updated.next_charge_ts = now + sub.period_secs;
                    // save updated sub...
                }
                Err(_) => failed += 1,
            }
        }

        env.events().publish((symbol_short!("process"),), (service_id, charged, failed));
        ProcessResult { charged, failed, skipped }
    }

    // ================ QUERY METHODS ================
    pub fn get_subscription(env: Env, sub_id: u64) -> Subscription {
        let subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        subs.get(sub_id).unwrap_or_else(|| panic_with_error!(env, Error::SubscriptionNotFound))
    }

    pub fn get_subscriber_subs(env: Env, subscriber: Address) -> Vec<Subscription> {
        let mut result = Vec::new(&env);
        let subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        for (_, sub) in subs.iter() {
            if sub.subscriber == subscriber { result.push_back(sub); }
        }
        result
    }

    pub fn get_merchant_subs(env: Env, merchant: Address, service_id: u64) -> Vec<Subscription> {
        let mut result = Vec::new(&env);
        let subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        for (_, sub) in subs.iter() {
            if sub.service_id == service_id {
                let services: Map<u64, Service> = env.storage().persistent().get(&SERVICES).unwrap_or_else(|| Map::new(&env));
                if let Some(s) = services.get(sub.service_id) {
                    if s.merchant == merchant { result.push_back(sub); }
                }
            }
        }
        result
    }

    pub fn get_service(env: Env, service_id: u64) -> Service {
        let services: Map<u64, Service> = env.storage().persistent().get(&SERVICES).unwrap_or_else(|| Map::new(&env));
        services.get(service_id).unwrap_or_else(|| panic_with_error!(env, Error::ServiceNotFound))
    }

    pub fn get_merchant_services(env: Env, merchant: Address) -> Vec<Service> {
        let mut result = Vec::new(&env);
        let services: Map<u64, Service> = env.storage().persistent().get(&SERVICES).unwrap_or_else(|| Map::new(&env));
        for (_, s) in services.iter() {
            if s.merchant == merchant { result.push_back(s); }
        }
        result
    }

    pub fn is_subscription_active(env: Env, subscriber: Address, service_id: u64) -> bool {
        let subs: Map<u64, Subscription> = env.storage().persistent().get(&SUBSCRIPTIONS).unwrap_or_else(|| Map::new(&env));
        for (_, sub) in subs.iter() {
            if sub.subscriber == subscriber && sub.service_id == service_id && sub.service_end_ts > env.ledger().timestamp() {
                return true;
            }
        }
        false
    }

    // ================ ADMIN ================
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin: Address = env.storage().persistent().get(&ADMIN).unwrap();
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        env.events().publish((symbol_short!("upgrade"),), ());
    }

    pub fn version() -> u32 { 3 }
    }
