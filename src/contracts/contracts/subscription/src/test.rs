#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::{StellarAssetClient, TokenClient as TestTokenClient},
    Address, Env, String,
};

const DAY: u64 = 86_400;
const MONTH: u64 = 30 * DAY;
const WEEK: u64 = 7 * DAY;
const PRICE: i128 = 1_000;
const INITIAL_BALANCE: i128 = 100_000;

#[allow(dead_code)]
struct Setup<'a> {
    env: Env,
    client: SubscriptionContractClient<'a>,
    contract_addr: Address,
    admin: Address,
    subscriber: Address,
    subscriber2: Address,
    merchant: Address,
    merchant2: Address,
    token: TestTokenClient<'a>,
    token_admin: StellarAssetClient<'a>,
    token_addr: Address,
}

fn setup() -> Setup<'static> {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);

    let token_admin_addr = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(token_admin_addr.clone());
    let token_addr = sac.address();
    let token = TestTokenClient::new(&env, &token_addr);
    let token_admin = StellarAssetClient::new(&env, &token_addr);

    let contract_id = env.register(SubscriptionContract, (&admin, &token_addr));
    let client = SubscriptionContractClient::new(&env, &contract_id);

    let subscriber = Address::generate(&env);
    let subscriber2 = Address::generate(&env);
    let merchant = Address::generate(&env);
    let merchant2 = Address::generate(&env);

    // Fund subscribers
    token_admin.mint(&subscriber, &INITIAL_BALANCE);
    token_admin.mint(&subscriber2, &INITIAL_BALANCE);

    Setup {
        env,
        client,
        contract_addr: contract_id,
        admin,
        subscriber,
        subscriber2,
        merchant,
        merchant2,
        token,
        token_admin,
        token_addr,
    }
}

fn advance_time(env: &Env, timestamp: u64) {
    env.ledger().with_mut(|li| {
        li.timestamp = timestamp;
    });
}

fn register_default_service(s: &Setup) -> Service {
    s.client.register_service(
        &s.merchant,
        &String::from_str(&s.env, "Premium Plan"),
        &PRICE,
        &MONTH,
        &0,
        &12,
    )
}

fn register_trial_service(s: &Setup) -> Service {
    s.client.register_service(
        &s.merchant,
        &String::from_str(&s.env, "Trial Plan"),
        &PRICE,
        &MONTH,
        &WEEK,
        &12,
    )
}

// ===========================================================================
// Service Registration
// ===========================================================================

#[test]
fn test_register_service() {
    let s = setup();
    let svc = register_default_service(&s);

    assert_eq!(svc.service_id, 0);
    assert_eq!(svc.merchant, s.merchant);
    assert_eq!(svc.name, String::from_str(&s.env, "Premium Plan"));
    assert_eq!(svc.price, PRICE);
    assert_eq!(svc.period_secs, MONTH);
    assert_eq!(svc.trial_period_secs, 0);
    assert_eq!(svc.is_active, true);
}

#[test]
fn test_register_service_invalid_price() {
    let s = setup();
    let result = s.client.try_register_service(
        &s.merchant,
        &String::from_str(&s.env, "Bad"),
        &0,
        &MONTH,
        &0,
        &12,
    );
    assert_eq!(result, Err(Ok(ContractError::InvalidPrice)));
}

#[test]
fn test_register_service_invalid_period() {
    let s = setup();
    let result = s.client.try_register_service(
        &s.merchant,
        &String::from_str(&s.env, "Bad"),
        &PRICE,
        &0,
        &0,
        &12,
    );
    assert_eq!(result, Err(Ok(ContractError::InvalidPeriod)));
}

#[test]
fn test_register_service_invalid_name() {
    let s = setup();
    let result = s.client.try_register_service(
        &s.merchant,
        &String::from_str(&s.env, ""),
        &PRICE,
        &MONTH,
        &0,
        &12,
    );
    assert_eq!(result, Err(Ok(ContractError::InvalidServiceName)));
}

#[test]
fn test_register_multiple_services() {
    let s = setup();
    let svc1 = register_default_service(&s);
    let svc2 = s.client.register_service(
        &s.merchant,
        &String::from_str(&s.env, "Basic Plan"),
        &500,
        &WEEK,
        &0,
        &12,
    );

    assert_eq!(svc1.service_id, 0);
    assert_eq!(svc2.service_id, 1);

    let services = s.client.get_merchant_services(&s.merchant);
    assert_eq!(services.len(), 2);
}

#[test]
fn test_get_service() {
    let s = setup();
    let svc = register_default_service(&s);
    let fetched = s.client.get_service(&svc.service_id);
    assert_eq!(fetched, svc);
}

#[test]
fn test_get_service_not_found() {
    let s = setup();
    let result = s.client.try_get_service(&99);
    assert_eq!(result, Err(Ok(ContractError::ServiceNotFound)));
}

// ===========================================================================
// Subscribe
// ===========================================================================

#[test]
fn test_subscribe_no_trial_auto_renew() {
    let s = setup();
    let svc = register_default_service(&s);

    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    assert_eq!(sub.auto_renew, true);
    assert_eq!(sub.price, PRICE);
    assert_eq!(sub.period_secs, MONTH);
    assert_eq!(sub.trial_period_secs, 0);
    assert_eq!(sub.trial_end_ts, 0);
    assert_eq!(sub.service_end_ts, MONTH);
    assert_eq!(sub.next_charge_ts, MONTH);

    // Immediate charge happened
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE - PRICE);
    assert_eq!(s.token.balance(&s.merchant), PRICE);

    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        true
    );
}

#[test]
fn test_subscribe_no_trial_no_auto_renew() {
    let s = setup();
    let svc = register_default_service(&s);

    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &false);

    assert_eq!(sub.auto_renew, false);
    assert_eq!(sub.price, PRICE);

    // Immediate charge still happens for first period
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE - PRICE);

    // Service is active during period
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        true
    );

    // Won't renew after period ends
    advance_time(&s.env, MONTH + 1);
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        false
    );
}

#[test]
fn test_subscribe_with_trial_auto_renew() {
    let s = setup();
    let svc = register_trial_service(&s);

    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    assert_eq!(sub.auto_renew, true);
    assert_eq!(sub.trial_period_secs, WEEK);
    assert_eq!(sub.trial_end_ts, WEEK);
    assert_eq!(sub.service_end_ts, WEEK);
    assert_eq!(sub.next_charge_ts, WEEK);

    // No charge during trial
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE);
    assert_eq!(s.token.balance(&s.merchant), 0);

    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        true
    );
}

#[test]
fn test_subscribe_with_trial_no_auto_renew() {
    let s = setup();
    let svc = register_trial_service(&s);

    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &false);

    assert_eq!(sub.auto_renew, false);
    assert_eq!(sub.trial_period_secs, WEEK);
    assert_eq!(sub.trial_end_ts, WEEK);
    assert_eq!(sub.service_end_ts, WEEK);

    // No charge, no approval – trial only
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE);

    // Active during trial
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        true
    );

    // Expires after trial
    advance_time(&s.env, WEEK + 1);
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        false
    );

    // Process won't charge since auto_renew=false
    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 0);
    assert_eq!(result.skipped, 1);
}

#[test]
fn test_subscribe_trial_abuse_blocked() {
    let s = setup();
    let svc = register_trial_service(&s);

    // First trial subscription (no auto_renew)
    s.client.subscribe(&s.subscriber, &svc.service_id, &false);

    // Wait for trial to expire
    advance_time(&s.env, WEEK + 1);
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        false
    );

    // Attempt to get another free trial — should be blocked
    let result = s
        .client
        .try_subscribe(&s.subscriber, &svc.service_id, &false);
    assert_eq!(result, Err(Ok(ContractError::AlreadySubscribed)));

    // But re-subscribing with auto_renew=true should work
    let sub2 = s.client.subscribe(&s.subscriber, &svc.service_id, &true);
    assert_eq!(sub2.auto_renew, true);
}

#[test]
fn test_subscribe_multiple_services() {
    let s = setup();
    let svc1 = register_default_service(&s);
    let svc2 = s.client.register_service(
        &s.merchant2,
        &String::from_str(&s.env, "Other Plan"),
        &500,
        &WEEK,
        &0,
        &12,
    );

    let sub1 = s.client.subscribe(&s.subscriber, &svc1.service_id, &true);
    let sub2 = s.client.subscribe(&s.subscriber, &svc2.service_id, &true);

    assert_eq!(sub1.service_id, svc1.service_id);
    assert_eq!(sub2.service_id, svc2.service_id);
    assert_eq!(sub1.price, PRICE);
    assert_eq!(sub2.price, 500);

    let subs = s.client.get_subscriber_subs(&s.subscriber);
    assert_eq!(subs.len(), 2);
}

#[test]
fn test_subscribe_duplicate_rejected() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let result = s
        .client
        .try_subscribe(&s.subscriber, &svc.service_id, &true);
    assert_eq!(result, Err(Ok(ContractError::AlreadySubscribed)));
}

#[test]
fn test_subscribe_nonexistent_service() {
    let s = setup();
    let result = s.client.try_subscribe(&s.subscriber, &99, &true);
    assert_eq!(result, Err(Ok(ContractError::ServiceNotFound)));
}

#[test]
fn test_subscribe_resubscribe_after_expiry() {
    let s = setup();
    let svc = register_default_service(&s);

    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);
    s.client.cancel(&s.subscriber, &sub.sub_id);

    // Advance past service_end_ts
    advance_time(&s.env, MONTH + 1);

    // Re-subscribe should work
    let sub2 = s.client.subscribe(&s.subscriber, &svc.service_id, &true);
    assert_eq!(sub2.auto_renew, true);
    assert!(sub2.sub_id != sub.sub_id);
}

// ===========================================================================
// Cancel
// ===========================================================================

#[test]
fn test_cancel_subscription() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    advance_time(&s.env, 15 * DAY);
    s.client.cancel(&s.subscriber, &sub.sub_id);

    let updated = s.client.get_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(updated.auto_renew, false);
    assert_eq!(updated.service_end_ts, MONTH);

    // Service still active mid-period
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        true
    );

    // Service inactive after period ends
    advance_time(&s.env, MONTH + 1);
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        false
    );
}

#[test]
fn test_cancel_nonexistent() {
    let s = setup();
    let result = s.client.try_cancel(&s.subscriber, &999);
    assert_eq!(result, Err(Ok(ContractError::SubscriptionNotFound)));
}

#[test]
fn test_cancel_already_cancelled() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    s.client.cancel(&s.subscriber, &sub.sub_id);

    let result = s.client.try_cancel(&s.subscriber, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::AlreadyCancelled)));
}

#[test]
fn test_cancel_wrong_subscriber() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let result = s.client.try_cancel(&s.subscriber2, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::Unauthorized)));
}

#[test]
fn test_cancel_during_trial() {
    let s = setup();
    let svc = register_trial_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    advance_time(&s.env, 3 * DAY);
    s.client.cancel(&s.subscriber, &sub.sub_id);

    // Service still active during trial
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        true
    );

    // Service inactive after trial ends
    advance_time(&s.env, WEEK + 1);
    assert_eq!(
        s.client
            .is_subscription_active(&s.subscriber, &svc.service_id),
        false
    );

    // No charge ever happened
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE);
}

// ===========================================================================
// Toggle Pay-Upfront
// ===========================================================================

#[test]
fn test_toggle_auto_renew_off() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    advance_time(&s.env, 10 * DAY);

    let result = s.client.toggle_auto_renew(&s.subscriber, &sub.sub_id);
    assert_eq!(result, false);

    let updated = s.client.get_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(updated.auto_renew, false);
}

#[test]
fn test_toggle_auto_renew_back_on() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    advance_time(&s.env, 10 * DAY);

    // Toggle off
    let r1 = s.client.toggle_auto_renew(&s.subscriber, &sub.sub_id);
    assert_eq!(r1, false);

    // Toggle back on (still within service_end_ts)
    let r2 = s.client.toggle_auto_renew(&s.subscriber, &sub.sub_id);
    assert_eq!(r2, true);

    let updated = s.client.get_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(updated.auto_renew, true);
}

#[test]
fn test_toggle_auto_renew_expired_fails() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    // Cancel then let it expire
    s.client.cancel(&s.subscriber, &sub.sub_id);
    advance_time(&s.env, MONTH + 1);

    // Cannot re-enable on expired sub
    let result = s
        .client
        .try_toggle_auto_renew(&s.subscriber, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::SubscriptionExpired)));
}

#[test]
fn test_toggle_auto_renew_wrong_subscriber() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let result = s
        .client
        .try_toggle_auto_renew(&s.subscriber2, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::Unauthorized)));
}

// ===========================================================================
// Extend Subscription
// ===========================================================================

#[test]
fn test_extend_subscription() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    advance_time(&s.env, 10 * DAY);

    let extended = s
        .client
        .extend_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(extended.auto_renew, true);
    assert_eq!(extended.sub_id, sub.sub_id);
}

#[test]
fn test_extend_subscription_reactivates_auto_renew() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    // Cancel (sets auto_renew to false)
    s.client.cancel(&s.subscriber, &sub.sub_id);
    let cancelled = s.client.get_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(cancelled.auto_renew, false);

    // Extend while still within service period
    advance_time(&s.env, 10 * DAY);
    let extended = s
        .client
        .extend_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(extended.auto_renew, true);
}

#[test]
fn test_extend_subscription_from_no_auto_renew() {
    let s = setup();
    let svc = register_default_service(&s);

    // Subscribe without auto_renew (one-time)
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &false);
    assert_eq!(sub.auto_renew, false);

    // Decide to continue: extend mid-period
    advance_time(&s.env, 10 * DAY);
    let extended = s
        .client
        .extend_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(extended.auto_renew, true);

    // Now process() can charge after current period ends
    s.token
        .approve(&s.subscriber, &s.contract_addr, &INITIAL_BALANCE, &10000);
    advance_time(&s.env, MONTH + 1);
    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 1);
}

#[test]
fn test_extend_subscription_expired_fails() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    s.client.cancel(&s.subscriber, &sub.sub_id);
    advance_time(&s.env, MONTH + 1);

    let result = s
        .client
        .try_extend_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::SubscriptionExpired)));
}

#[test]
fn test_extend_subscription_wrong_subscriber() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let result = s
        .client
        .try_extend_subscription(&s.subscriber2, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::Unauthorized)));
}

// ===========================================================================
// Process
// ===========================================================================

#[test]
fn test_process_single_charge() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    // Set explicit approval for process transfer_from
    s.token
        .approve(&s.subscriber, &s.contract_addr, &INITIAL_BALANCE, &10000);

    advance_time(&s.env, MONTH + 1);

    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 1);
    assert_eq!(result.failed, 0);
    assert_eq!(result.skipped, 0);

    // Two charges: subscribe + renewal
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE - 2 * PRICE);
    assert_eq!(s.token.balance(&s.merchant), 2 * PRICE);
}

#[test]
fn test_process_batch_multiple_subscribers() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);
    s.client.subscribe(&s.subscriber2, &svc.service_id, &true);

    s.token
        .approve(&s.subscriber, &s.contract_addr, &INITIAL_BALANCE, &10000);
    s.token
        .approve(&s.subscriber2, &s.contract_addr, &INITIAL_BALANCE, &10000);

    advance_time(&s.env, MONTH + 1);

    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 2);
    assert_eq!(result.failed, 0);
    assert_eq!(result.skipped, 0);
}

#[test]
fn test_process_insufficient_funds() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    // Drain subscriber balance so renewal fails
    let remaining = s.token.balance(&s.subscriber);
    s.token.transfer(&s.subscriber, &s.admin, &remaining);
    assert_eq!(s.token.balance(&s.subscriber), 0);

    advance_time(&s.env, MONTH + 1);

    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 0);
    assert_eq!(result.failed, 1);
    assert_eq!(result.skipped, 0);

    let sub = s.client.get_subscription(&s.subscriber, &0);
    assert_eq!(sub.auto_renew, false);
}

#[test]
fn test_process_before_due() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    // Don't advance time
    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 0);
    assert_eq!(result.failed, 0);
    assert_eq!(result.skipped, 1);

    // Only the initial subscribe charge
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE - PRICE);
}

#[test]
fn test_process_no_drift() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    s.token
        .approve(&s.subscriber, &s.contract_addr, &INITIAL_BALANCE, &10000);

    // Advance 5 days past due
    advance_time(&s.env, MONTH + 5 * DAY);

    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 1);

    // next_charge_ts = old_next_charge_ts + period, not now + period
    let sub = s.client.get_subscription(&s.subscriber, &0);
    assert_eq!(sub.next_charge_ts, MONTH + MONTH);
    assert_eq!(sub.service_end_ts, MONTH + MONTH);
}

#[test]
fn test_process_wrong_merchant() {
    let s = setup();
    let svc = register_default_service(&s);
    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let result = s.client.try_process(&s.merchant2, &svc.service_id, &0, &100);
    assert_eq!(result, Err(Ok(ContractError::NotServiceOwner)));
}

#[test]
fn test_process_trial_expiry_and_first_charge() {
    let s = setup();
    let svc = register_trial_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    // No charge during trial
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE);

    s.token
        .approve(&s.subscriber, &s.contract_addr, &INITIAL_BALANCE, &10000);

    // Advance past trial
    advance_time(&s.env, WEEK + 1);

    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 1);

    let sub = s.client.get_subscription(&s.subscriber, &0);
    assert_eq!(sub.next_charge_ts, WEEK + MONTH);
    assert_eq!(sub.service_end_ts, WEEK + MONTH);
    assert_eq!(sub.auto_renew, true);

    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE - PRICE);
    assert_eq!(s.token.balance(&s.merchant), PRICE);
}

#[test]
fn test_process_skips_no_auto_renew() {
    let s = setup();
    let svc = register_default_service(&s);

    // Subscribe without auto_renew
    s.client.subscribe(&s.subscriber, &svc.service_id, &false);

    advance_time(&s.env, MONTH + 1);

    let result = s.client.process(&s.merchant, &svc.service_id, &0, &100);
    assert_eq!(result.charged, 0);
    assert_eq!(result.failed, 0);
    assert_eq!(result.skipped, 1);

    // Only the initial charge, no renewal
    assert_eq!(s.token.balance(&s.subscriber), INITIAL_BALANCE - PRICE);
}

// ===========================================================================
// Access Control
// ===========================================================================

#[test]
fn test_get_subscription_by_subscriber() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let fetched = s.client.get_subscription(&s.subscriber, &sub.sub_id);
    assert_eq!(fetched, sub);
}

#[test]
fn test_get_subscription_by_merchant() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let fetched = s.client.get_subscription(&s.merchant, &sub.sub_id);
    assert_eq!(fetched, sub);
}

#[test]
fn test_get_subscription_unauthorized() {
    let s = setup();
    let svc = register_default_service(&s);
    let sub = s.client.subscribe(&s.subscriber, &svc.service_id, &true);

    let result = s
        .client
        .try_get_subscription(&s.subscriber2, &sub.sub_id);
    assert_eq!(result, Err(Ok(ContractError::Unauthorized)));
}

#[test]
fn test_get_subscriber_subs() {
    let s = setup();
    let svc1 = register_default_service(&s);
    let svc2 = s.client.register_service(
        &s.merchant2,
        &String::from_str(&s.env, "Other"),
        &500,
        &WEEK,
        &0,
        &12,
    );

    s.client.subscribe(&s.subscriber, &svc1.service_id, &true);
    s.client.subscribe(&s.subscriber, &svc2.service_id, &true);

    let subs = s.client.get_subscriber_subs(&s.subscriber);
    assert_eq!(subs.len(), 2);
}

#[test]
fn test_get_merchant_subs() {
    let s = setup();
    let svc = register_default_service(&s);

    s.client.subscribe(&s.subscriber, &svc.service_id, &true);
    s.client.subscribe(&s.subscriber2, &svc.service_id, &true);

    let subs = s.client.get_merchant_subs(&s.merchant, &svc.service_id);
    assert_eq!(subs.len(), 2);
}

#[test]
fn test_get_merchant_subs_wrong_merchant() {
    let s = setup();
    let svc = register_default_service(&s);

    let result = s
        .client
        .try_get_merchant_subs(&s.merchant2, &svc.service_id);
    assert_eq!(result, Err(Ok(ContractError::NotServiceOwner)));
}

// ===========================================================================
// is_subscription_active
// ===========================================================================

#[test]
fn test_is_subscription_active_no_subscription() {
    let s = setup();
    let random = Address::generate(&s.env);
    assert_eq!(s.client.is_subscription_active(&random, &0), false);
}

// ===========================================================================
// Admin
// ===========================================================================

mod upgrade_wasm {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/subscription.wasm");
}

#[test]
fn test_upgrade() {
    let s = setup();
    let wasm_hash = s.env.deployer().upload_contract_wasm(upgrade_wasm::WASM);
    s.client.upgrade(&wasm_hash);
    assert_eq!(s.client.version(), 1);
}

#[test]
fn test_version() {
    let s = setup();
    assert_eq!(s.client.version(), 1);
}

// ===========================================================================
// Timestamp overflow (H-3 fix)
// ===========================================================================

#[test]
fn test_timestamp_overflow() {
    let s = setup();
    let svc = register_default_service(&s);

    // Advance to near u64::MAX
    advance_time(&s.env, u64::MAX - 100);

    // Subscribe should fail with overflow since now + period_secs overflows
    let result = s
        .client
        .try_subscribe(&s.subscriber, &svc.service_id, &true);
    assert_eq!(result, Err(Ok(ContractError::TimestampOverflow)));
}
