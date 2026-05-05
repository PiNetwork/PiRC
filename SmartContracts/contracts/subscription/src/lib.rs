#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token::TokenClient, Address,
    BytesN, Env, String, Vec,
};

// ---------------------------------------------------------------------------
// TTL constants (~5 s per ledger)
// ---------------------------------------------------------------------------
const INSTANCE_TTL_THRESHOLD: u32 = 17_280; // ~1 day
const INSTANCE_TTL_EXTEND: u32 = 518_400; // ~30 days
const PERSISTENT_TTL_THRESHOLD: u32 = 17_280;
const PERSISTENT_TTL_EXTEND_MIN: u32 = 518_400; // ~30 days floor
const SECS_PER_LEDGER: u64 = 5;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
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
    ServiceNotActive = 12,
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    // Instance storage
    Admin,
    Token,
    NextServiceId,
    NextSubId,
    // Persistent storage
    Service(u64),
    MerchantServices(Address),
    Sub(u64),
    SubscriberSubs(Address),
    ServiceSubs(u64),
    SubServicePair(Address, u64),
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------
#[derive(Clone, PartialEq, Debug)]
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

#[derive(Clone, PartialEq, Debug)]
#[contracttype]
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

#[derive(Clone, PartialEq, Debug)]
#[contracttype]
pub struct ProcessResult {
    pub charged: u32,
    pub failed: u32,
    pub skipped: u32,
    pub total: u32,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------
#[contract]
pub struct SubscriptionContract;

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------
fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_TTL_EXTEND);
}

/// Compute TTL extend: max(period_secs * 2 / SECS_PER_LEDGER, MIN_FLOOR)
fn ttl_extend_for_period(period_secs: u64) -> u32 {
    let ledgers = period_secs.saturating_mul(2) / SECS_PER_LEDGER;
    let capped = if ledgers > u32::MAX as u64 {
        u32::MAX
    } else {
        ledgers as u32
    };
    core::cmp::max(capped, PERSISTENT_TTL_EXTEND_MIN)
}

fn bump_persistent(env: &Env, key: &DataKey, period_secs: u64) {
    env.storage().persistent().extend_ttl(
        key,
        PERSISTENT_TTL_THRESHOLD,
        ttl_extend_for_period(period_secs),
    );
}

fn next_service_id(env: &Env) -> u64 {
    let id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextServiceId)
        .unwrap_or(0);
    env.storage()
        .instance()
        .set(&DataKey::NextServiceId, &(id + 1));
    id
}

fn next_sub_id(env: &Env) -> u64 {
    let id: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextSubId)
        .unwrap_or(0);
    env.storage().instance().set(&DataKey::NextSubId, &(id + 1));
    id
}

fn checked_add_ts(a: u64, b: u64) -> Result<u64, ContractError> {
    a.checked_add(b).ok_or(ContractError::TimestampOverflow)
}

fn get_token(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Token).unwrap()
}

fn do_approve(
    env: &Env,
    subscriber: &Address,
    service: &Service,
    periods: u64,
    extra_secs: u64,
) -> Result<(), ContractError> {
    let token = get_token(env);
    let token_client = TokenClient::new(env, &token);
    let contract_addr = env.current_contract_address();

    let approve_amount = service
        .price
        .checked_mul(periods as i128)
        .ok_or(ContractError::TimestampOverflow)?;
    let secs_to_approve = service
        .period_secs
        .saturating_mul(periods)
        .saturating_add(extra_secs);
    let ledgers_to_approve = secs_to_approve / 5;
    let capped_ledgers = if ledgers_to_approve > u32::MAX as u64 {
        u32::MAX
    } else {
        ledgers_to_approve as u32
    };
    let max_ttl = env.storage().max_ttl().saturating_sub(1);
    let capped_ledgers = core::cmp::min(capped_ledgers, max_ttl);
    // Round down to a stable bucket so the value is identical between simulate and execute.
    // 720 ledgers ≈ 1 hour — much larger than the simulate→execute gap (~seconds).
    const LEDGER_BUCKET: u32 = 720;
    let raw_expiration = env.ledger().sequence().saturating_add(capped_ledgers);
    let max_expiration = env.ledger().sequence().saturating_add(max_ttl);
    let capped = core::cmp::min(raw_expiration, max_expiration);
    let expiration_ledger = (capped / LEDGER_BUCKET) * LEDGER_BUCKET;

    token_client.approve(
        subscriber,
        &contract_addr,
        &approve_amount,
        &expiration_ledger,
    );

    env.events().publish(
        (symbol_short!("approve"),),
        (
            subscriber.clone(),
            service.service_id,
            approve_amount,
            expiration_ledger,
            token,
        ),
    );

    Ok(())
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------
#[contractimpl]
impl SubscriptionContract {
    // ---- Constructor ------------------------------------------------------

    pub fn __constructor(env: Env, admin: Address, token: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::NextServiceId, &0u64);
        env.storage().instance().set(&DataKey::NextSubId, &0u64);
        bump_instance(&env);
    }

    // ---- Service management -----------------------------------------------

    pub fn register_service(
        env: Env,
        merchant: Address,
        name: String,
        price: i128,
        period_secs: u64,
        trial_period_secs: u64,
        approve_periods: u64,
    ) -> Result<Service, ContractError> {
        if price <= 0 {
            return Err(ContractError::InvalidPrice);
        }
        if period_secs == 0 {
            return Err(ContractError::InvalidPeriod);
        }
        if name.len() == 0 {
            return Err(ContractError::InvalidServiceName);
        }
        if approve_periods == 0 {
            return Err(ContractError::InvalidPeriod);
        }

        merchant.require_auth();

        let service_id = next_service_id(&env);
        let now = env.ledger().timestamp();

        let service = Service {
            service_id,
            merchant: merchant.clone(),
            name,
            price,
            period_secs,
            trial_period_secs,
            approve_periods,
            is_active: true,
            created_at: now,
        };

        let svc_key = DataKey::Service(service_id);
        env.storage().persistent().set(&svc_key, &service);
        bump_persistent(&env, &svc_key, period_secs);

        // Append to merchant's service list
        let ms_key = DataKey::MerchantServices(merchant);
        let mut svc_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&ms_key)
            .unwrap_or_else(|| Vec::new(&env));
        svc_ids.push_back(service_id);
        env.storage().persistent().set(&ms_key, &svc_ids);
        bump_persistent(&env, &ms_key, period_secs);

        bump_instance(&env);

        env.events()
            .publish((symbol_short!("srv_reg"),), service.clone());

        Ok(service)
    }

    // ---- Subscription lifecycle -------------------------------------------

    /// Subscribe to a service.
    ///
    /// `auto_renew` controls whether the subscription will auto-renew via
    /// merchant-initiated `process()` calls.
    ///
    /// **With trial period:**
    /// - `auto_renew = true`  – approves the contract for `approve_periods`
    ///   future periods; no immediate payment. After the trial, `process()`
    ///   charges each period.
    /// - `auto_renew = false` – subscription covers the trial period only;
    ///   no approval, no payment.  Expires when the trial ends.
    ///
    /// **Without trial period:**
    /// - `auto_renew = true`  – immediately transfers the first period's price
    ///   and approves the contract for `approve_periods` future periods.
    /// - `auto_renew = false` – immediately transfers the first period's price
    ///   and approves the contract for 1 period.  `process()` will skip this
    ///   subscription, so it expires after the paid period unless extended via
    ///   `extend_subscription`.
    pub fn subscribe(
        env: Env,
        subscriber: Address,
        service_id: u64,
        auto_renew: bool,
    ) -> Result<Subscription, ContractError> {
        subscriber.require_auth();

        let svc_key = DataKey::Service(service_id);
        let service: Service = env
            .storage()
            .persistent()
            .get(&svc_key)
            .ok_or(ContractError::ServiceNotFound)?;
        bump_persistent(&env, &svc_key, service.period_secs);

        if !service.is_active {
            return Err(ContractError::ServiceNotActive);
        }

        // ---- Dedup check ----
        let pair_key = DataKey::SubServicePair(subscriber.clone(), service_id);
        let had_trial = if let Some(existing_sub_id) =
            env.storage().persistent().get::<_, u64>(&pair_key)
        {
            bump_persistent(&env, &pair_key, service.period_secs);
            let sub_key = DataKey::Sub(existing_sub_id);
            if let Some(existing) = env.storage().persistent().get::<_, Subscription>(&sub_key) {
                bump_persistent(&env, &sub_key, existing.period_secs);
                if existing.auto_renew || env.ledger().timestamp() < existing.service_end_ts {
                    return Err(ContractError::AlreadySubscribed);
                }
                existing.trial_period_secs > 0
            } else {
                false
            }
        } else {
            false
        };

        // Prevent repeated free trial: if the subscriber already used a trial
        // for this service, they cannot re-subscribe without auto_renew.
        if had_trial && !auto_renew && service.trial_period_secs > 0 {
            return Err(ContractError::AlreadySubscribed);
        }

        let now = env.ledger().timestamp();
        let sub_id = next_sub_id(&env);
        let token = get_token(&env);
        let token_client = TokenClient::new(&env, &token);

        let has_trial = service.trial_period_secs > 0;

        let sub = if has_trial {
            let trial_end = checked_add_ts(now, service.trial_period_secs)?;

            if auto_renew {
                // Trial + auto_renew: approve for future periods; extra_secs covers the trial
                do_approve(
                    &env,
                    &subscriber,
                    &service,
                    service.approve_periods,
                    service.trial_period_secs,
                )?;

                let balance = token_client.balance(&subscriber);
                if balance < service.price {
                    env.events().publish(
                        (symbol_short!("low_bal"),),
                        (subscriber.clone(), service_id, balance, service.price),
                    );
                }
            }
            // Trial + !auto_renew: no approval, no payment – trial only

            Subscription {
                sub_id,
                subscriber: subscriber.clone(),
                service_id,
                price: service.price,
                period_secs: service.period_secs,
                trial_period_secs: service.trial_period_secs,
                trial_end_ts: trial_end,
                auto_renew,
                service_end_ts: trial_end,
                next_charge_ts: trial_end,
                created_at: now,
            }
        } else {
            let period_end = checked_add_ts(now, service.period_secs)?;

            // Approve before transfer so the contract is pre-authorized
            let periods = if auto_renew { service.approve_periods } else { 1 };
            do_approve(&env, &subscriber, &service, periods, 0)?;

            // No trial – immediate first payment
            token_client.transfer(&subscriber, &service.merchant, &service.price);

            if auto_renew {
                let balance = token_client.balance(&subscriber);
                if balance < service.price {
                    env.events().publish(
                        (symbol_short!("low_bal"),),
                        (subscriber.clone(), service_id, balance, service.price),
                    );
                }
            }

            Subscription {
                sub_id,
                subscriber: subscriber.clone(),
                service_id,
                price: service.price,
                period_secs: service.period_secs,
                trial_period_secs: 0,
                trial_end_ts: 0,
                auto_renew,
                service_end_ts: period_end,
                next_charge_ts: period_end,
                created_at: now,
            }
        };

        // ---- Persist subscription ----
        let ps = service.period_secs;
        let sub_key = DataKey::Sub(sub_id);
        env.storage().persistent().set(&sub_key, &sub);
        bump_persistent(&env, &sub_key, ps);

        env.storage().persistent().set(&pair_key, &sub_id);
        bump_persistent(&env, &pair_key, ps);

        // Append to subscriber's list
        let ss_key = DataKey::SubscriberSubs(subscriber.clone());
        let mut sub_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&ss_key)
            .unwrap_or_else(|| Vec::new(&env));
        sub_ids.push_back(sub_id);
        env.storage().persistent().set(&ss_key, &sub_ids);
        bump_persistent(&env, &ss_key, ps);

        // Append to service's subscriber list
        let svc_subs_key = DataKey::ServiceSubs(service_id);
        let mut svc_sub_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&svc_subs_key)
            .unwrap_or_else(|| Vec::new(&env));
        svc_sub_ids.push_back(sub_id);
        env.storage().persistent().set(&svc_subs_key, &svc_sub_ids);
        bump_persistent(&env, &svc_subs_key, ps);

        bump_instance(&env);

        env.events()
            .publish((symbol_short!("sub"),), (subscriber, service_id, sub_id));

        Ok(sub)
    }

    pub fn cancel(env: Env, subscriber: Address, sub_id: u64) -> Result<(), ContractError> {
        subscriber.require_auth();

        let sub_key = DataKey::Sub(sub_id);
        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&sub_key)
            .ok_or(ContractError::SubscriptionNotFound)?;

        if sub.subscriber != subscriber {
            return Err(ContractError::Unauthorized);
        }
        if !sub.auto_renew {
            return Err(ContractError::AlreadyCancelled);
        }

        sub.auto_renew = false;
        env.storage().persistent().set(&sub_key, &sub);
        bump_persistent(&env, &sub_key, sub.period_secs);
        bump_instance(&env);

        let now = env.ledger().timestamp();
        let remaining_secs = sub.service_end_ts.saturating_sub(now);

        env.events().publish(
            (symbol_short!("cancel"),),
            (subscriber, sub_id, sub.service_id, remaining_secs),
        );

        Ok(())
    }

    /// Toggle auto-renew on or off.  Cannot re-enable on an expired
    /// subscription.
    pub fn toggle_auto_renew(
        env: Env,
        subscriber: Address,
        sub_id: u64,
    ) -> Result<bool, ContractError> {
        subscriber.require_auth();

        let sub_key = DataKey::Sub(sub_id);
        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&sub_key)
            .ok_or(ContractError::SubscriptionNotFound)?;

        if sub.subscriber != subscriber {
            return Err(ContractError::Unauthorized);
        }

        let now = env.ledger().timestamp();

        // Prevent re-enabling on a fully expired subscription
        if !sub.auto_renew && now >= sub.service_end_ts {
            return Err(ContractError::SubscriptionExpired);
        }

        sub.auto_renew = !sub.auto_renew;

        // If re-enabling, refresh the token approval so process() can charge
        if sub.auto_renew {
            let svc_key = DataKey::Service(sub.service_id);
            let service: Service = env
                .storage()
                .persistent()
                .get(&svc_key)
                .ok_or(ContractError::ServiceNotFound)?;

            do_approve(&env, &subscriber, &service, service.approve_periods, 0)?;
            bump_persistent(&env, &svc_key, sub.period_secs);
        }

        env.storage().persistent().set(&sub_key, &sub);
        bump_persistent(&env, &sub_key, sub.period_secs);
        bump_instance(&env);

        env.events().publish(
            (symbol_short!("renew"),),
            (subscriber, sub_id, sub.service_id, sub.auto_renew),
        );

        Ok(sub.auto_renew)
    }

    /// Extend an active subscription by refreshing the token approval.
    ///
    /// Call this when your allowance is running low and you want the
    /// subscription to continue renewing.  Sets `auto_renew` to `true`
    /// and approves the contract for `approve_periods` future periods.
    pub fn extend_subscription(
        env: Env,
        subscriber: Address,
        sub_id: u64,
    ) -> Result<Subscription, ContractError> {
        subscriber.require_auth();

        let sub_key = DataKey::Sub(sub_id);
        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&sub_key)
            .ok_or(ContractError::SubscriptionNotFound)?;

        if sub.subscriber != subscriber {
            return Err(ContractError::Unauthorized);
        }

        let now = env.ledger().timestamp();
        if now >= sub.service_end_ts {
            return Err(ContractError::SubscriptionExpired);
        }

        let svc_key = DataKey::Service(sub.service_id);
        let service: Service = env
            .storage()
            .persistent()
            .get(&svc_key)
            .ok_or(ContractError::ServiceNotFound)?;

        do_approve(&env, &subscriber, &service, service.approve_periods, 0)?;

        sub.auto_renew = true;
        env.storage().persistent().set(&sub_key, &sub);
        bump_persistent(&env, &sub_key, sub.period_secs);
        bump_persistent(&env, &svc_key, sub.period_secs);
        bump_instance(&env);

        env.events().publish(
            (symbol_short!("extend"),),
            (subscriber, sub_id, sub.service_id),
        );

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

        let svc_key = DataKey::Service(service_id);
        let service: Service = env
            .storage()
            .persistent()
            .get(&svc_key)
            .ok_or(ContractError::ServiceNotFound)?;

        if service.merchant != merchant {
            return Err(ContractError::NotServiceOwner);
        }
        bump_persistent(&env, &svc_key, service.period_secs);

        let token = get_token(&env);
        let token_client = TokenClient::new(&env, &token);
        let contract_addr = env.current_contract_address();
        let now = env.ledger().timestamp();

        let svc_subs_key = DataKey::ServiceSubs(service_id);
        let sub_ids: Vec<u64> = match env.storage().persistent().get(&svc_subs_key) {
            Some(ids) => {
                bump_persistent(&env, &svc_subs_key, service.period_secs);
                ids
            }
            None => Vec::new(&env),
        };

        let total = sub_ids.len();
        let start = offset.min(total);
        let end = start.saturating_add(limit).min(total);

        let mut charged: u32 = 0;
        let mut failed: u32 = 0;
        let mut skipped: u32 = 0;

        for i in start..end {
            let sid = sub_ids.get(i).unwrap();
            let sub_key = DataKey::Sub(sid);

            let mut sub: Subscription = match env.storage().persistent().get(&sub_key) {
                Some(s) => s,
                None => {
                    skipped += 1;
                    continue;
                }
            };

            if !sub.auto_renew {
                skipped += 1;
                continue;
            }

            if now < sub.next_charge_ts {
                skipped += 1;
                continue;
            }

            let payment_result = token_client.try_transfer_from(
                &contract_addr,
                &sub.subscriber,
                &merchant,
                &sub.price,
            );

            if payment_result.is_ok() {
                // Detect trial -> paid transition (first real charge)
                let was_trial = sub.trial_period_secs > 0
                    && sub.next_charge_ts == sub.trial_end_ts;

                let new_next = match sub.next_charge_ts.checked_add(sub.period_secs) {
                    Some(ts) => ts,
                    None => {
                        // Overflow: disable auto-renew rather than reverting the batch
                        sub.auto_renew = false;
                        env.storage().persistent().set(&sub_key, &sub);
                        bump_persistent(&env, &sub_key, sub.period_secs);
                        failed += 1;
                        env.events().publish(
                            (symbol_short!("chg_fail"),),
                            (sub.subscriber.clone(), service_id, sub.sub_id),
                        );
                        continue;
                    }
                };
                sub.next_charge_ts = new_next;
                sub.service_end_ts = new_next;
                env.storage().persistent().set(&sub_key, &sub);
                bump_persistent(&env, &sub_key, sub.period_secs);
                charged += 1;

                env.events().publish(
                    (symbol_short!("charge"),),
                    (sub.subscriber.clone(), service_id, sub.price),
                );

                // Trial just ended -> first paid period started
                if was_trial {
                    env.events().publish(
                        (symbol_short!("trl_end"),),
                        (sub.subscriber.clone(), service_id, sub.sub_id),
                    );
                }

                // Check remaining allowance for next cycle
                let remaining_allowance =
                    token_client.allowance(&sub.subscriber, &contract_addr);
                if remaining_allowance < sub.price {
                    env.events().publish(
                        (symbol_short!("low_alw"),),
                        (sub.subscriber.clone(), service_id, remaining_allowance, sub.price),
                    );
                }

                // Check subscriber balance for next cycle
                let balance = token_client.balance(&sub.subscriber);
                if balance < sub.price {
                    env.events().publish(
                        (symbol_short!("low_bal"),),
                        (sub.subscriber.clone(), service_id, balance, sub.price),
                    );
                }
            } else {
                sub.auto_renew = false;
                env.storage().persistent().set(&sub_key, &sub);
                bump_persistent(&env, &sub_key, sub.period_secs);
                failed += 1;

                env.events().publish(
                    (symbol_short!("chg_fail"),),
                    (sub.subscriber.clone(), service_id, sub.sub_id),
                );
            }
        }

        bump_instance(&env);

        Ok(ProcessResult {
            charged,
            failed,
            skipped,
            total,
        })
    }

    // ---- Queries ----------------------------------------------------------

    pub fn get_subscription(
        env: Env,
        caller: Address,
        sub_id: u64,
    ) -> Result<Subscription, ContractError> {
        caller.require_auth();

        let sub_key = DataKey::Sub(sub_id);
        let sub: Subscription = env
            .storage()
            .persistent()
            .get(&sub_key)
            .ok_or(ContractError::SubscriptionNotFound)?;

        if caller != sub.subscriber {
            let svc_key = DataKey::Service(sub.service_id);
            let service: Service = env
                .storage()
                .persistent()
                .get(&svc_key)
                .ok_or(ContractError::ServiceNotFound)?;
            if caller != service.merchant {
                return Err(ContractError::Unauthorized);
            }
        }

        Ok(sub)
    }

    pub fn get_subscriber_subs(env: Env, subscriber: Address) -> Vec<Subscription> {
        subscriber.require_auth();

        let ss_key = DataKey::SubscriberSubs(subscriber);
        let sub_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&ss_key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut result: Vec<Subscription> = Vec::new(&env);
        for i in 0..sub_ids.len() {
            let sid = sub_ids.get(i).unwrap();
            if let Some(sub) = env.storage().persistent().get::<_, Subscription>(&DataKey::Sub(sid))
            {
                result.push_back(sub);
            }
        }
        result
    }

    pub fn get_merchant_subs(
        env: Env,
        merchant: Address,
        service_id: u64,
    ) -> Result<Vec<Subscription>, ContractError> {
        merchant.require_auth();

        let svc_key = DataKey::Service(service_id);
        let service: Service = env
            .storage()
            .persistent()
            .get(&svc_key)
            .ok_or(ContractError::ServiceNotFound)?;

        if service.merchant != merchant {
            return Err(ContractError::NotServiceOwner);
        }

        let svc_subs_key = DataKey::ServiceSubs(service_id);
        let sub_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&svc_subs_key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut result: Vec<Subscription> = Vec::new(&env);
        for i in 0..sub_ids.len() {
            let sid = sub_ids.get(i).unwrap();
            if let Some(sub) =
                env.storage().persistent().get::<_, Subscription>(&DataKey::Sub(sid))
            {
                result.push_back(sub);
            }
        }
        Ok(result)
    }

    pub fn get_service(env: Env, service_id: u64) -> Result<Service, ContractError> {
        let svc_key = DataKey::Service(service_id);
        env.storage()
            .persistent()
            .get(&svc_key)
            .ok_or(ContractError::ServiceNotFound)
    }

    pub fn get_merchant_services(env: Env, merchant: Address) -> Vec<Service> {
        let ms_key = DataKey::MerchantServices(merchant);
        let svc_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&ms_key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut result: Vec<Service> = Vec::new(&env);
        for i in 0..svc_ids.len() {
            let sid = svc_ids.get(i).unwrap();
            if let Some(svc) =
                env.storage().persistent().get::<_, Service>(&DataKey::Service(sid))
            {
                result.push_back(svc);
            }
        }
        result
    }

    pub fn is_subscription_active(env: Env, subscriber: Address, service_id: u64) -> bool {
        let pair_key = DataKey::SubServicePair(subscriber, service_id);
        let sub_id: u64 = match env.storage().persistent().get(&pair_key) {
            Some(id) => id,
            None => return false,
        };
        let sub: Subscription = match env
            .storage()
            .persistent()
            .get(&DataKey::Sub(sub_id))
        {
            Some(s) => s,
            None => return false,
        };
        env.ledger().timestamp() < sub.service_end_ts
    }

    // ---- Admin ------------------------------------------------------------

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.deployer()
            .update_current_contract_wasm(new_wasm_hash.clone());
        bump_instance(&env);

        env.events()
            .publish((symbol_short!("upgrade"),), new_wasm_hash);
    }

    pub fn version(_env: Env) -> u32 {
        1
    }
}

mod test;
