# Paid Subscriptions Smart Contract

A Soroban smart contract for recurring paid subscriptions on the Pi Network. Merchants register services with configurable pricing and billing periods; subscribers pay using standard Stellar asset tokens via allowance-based recurring charges.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Contract API](#contract-api)
- [Payment Flow](#payment-flow)
- [Access Control](#access-control)
- [Events](#events)
- [Error Codes](#error-codes)
- [Storage Layout & TTL](#storage-layout--ttl)

---

## Overview

The contract implements a merchant-initiated pull-payment model:

1. **Merchant** registers a service (name, price, billing period, optional trial, approval window).
2. **Subscriber** subscribes to the service, optionally enabling auto-renewal and granting a token allowance to the contract for future charges.
3. **Merchant** periodically calls `process(service_id, offset, limit)` to batch-charge due subscribers via `transfer_from` against their approved allowances.
4. **Subscriber** can cancel, toggle auto-renewal, or extend their subscription at any time.

Key design properties:
- **No charge drift** -- `next_charge_ts` is always computed as `old_next_charge_ts + period_secs`, not from wall-clock time.
- **Paginated batch processing** -- `process()` accepts `offset` and `limit` parameters to handle large subscriber sets across multiple transactions.
- **Graceful failure isolation** -- failed charges and timestamp overflows disable auto-renewal (`auto_renew = false`) for the individual subscription instead of reverting the entire batch.
- **Deduplication** -- a subscriber cannot hold two active subscriptions to the same service simultaneously.
- **Trial abuse prevention** -- a subscriber who already used a free trial cannot re-subscribe without `auto_renew=true`, preventing infinite free trials.

---

## Architecture

```
Subscriber                 Contract                    Token Contract           Merchant
    |                         |                              |                     |
    |-- subscribe() --------->|                              |                     |
    |                         |-- approve(N periods) ------> |                     |
    |                         |-- transfer(price) ---------> |---> merchant         |
    |                         |                              |                     |
    |                         |<-------------- process() ----|                     |
    |                         |-- transfer_from(sub->merch)->|                     |
    |                         |   (for each due subscriber)  |                     |
    |                         |                              |                     |
    |-- cancel() ------------>|  sets auto_renew=false       |                     |
```

---

## Data Model

### Service

Registered by a merchant. Represents a billable subscription offering.

| Field              | Type      | Description                                                  |
|--------------------|-----------|--------------------------------------------------------------|
| `service_id`       | `u64`     | Auto-incrementing unique identifier                          |
| `merchant`         | `Address` | Merchant who owns the service                                |
| `name`             | `String`  | Human-readable service name (must be non-empty)              |
| `price`            | `i128`    | Amount charged per billing period (must be > 0)              |
| `period_secs`      | `u64`     | Billing period duration in seconds (must be > 0)             |
| `trial_period_secs`| `u64`     | Free trial duration in seconds (0 = no trial)                |
| `approve_periods`  | `u64`     | Number of billing periods the subscriber approves at once (must be > 0) |
| `is_active`        | `bool`    | Whether new subscriptions can be created                     |
| `created_at`       | `u64`     | Ledger timestamp at creation                                 |

### Subscription

Represents one subscriber's relationship to one service.

| Field              | Type      | Description                                                  |
|--------------------|-----------|--------------------------------------------------------------|
| `sub_id`           | `u64`     | Auto-incrementing unique identifier                          |
| `subscriber`       | `Address` | Subscriber's address                                         |
| `service_id`       | `u64`     | Reference to the parent service                              |
| `price`            | `i128`    | Price snapshot at subscription time                          |
| `period_secs`      | `u64`     | Period snapshot at subscription time                         |
| `trial_period_secs`| `u64`     | Trial period snapshot at subscription time                   |
| `trial_end_ts`     | `u64`     | Timestamp when trial ends (0 if no trial)                    |
| `auto_renew`       | `bool`    | If `true`, merchant can auto-charge via `process()`. If `false`, subscription expires at `service_end_ts` |
| `service_end_ts`   | `u64`     | Timestamp when access expires unless renewed                 |
| `next_charge_ts`   | `u64`     | Earliest timestamp for next `process()` charge               |
| `created_at`       | `u64`     | Ledger timestamp at creation                                 |

### ProcessResult

Returned by `process()` to report batch outcomes.

| Field     | Type  | Description                                        |
|-----------|-------|----------------------------------------------------|
| `charged` | `u32` | Number of subscriptions successfully charged        |
| `failed`  | `u32` | Number of subscriptions where payment or timestamp calculation failed |
| `skipped` | `u32` | Number of subscriptions not yet due, not found, or not auto-renewing |
| `total`   | `u32` | Total number of subscriptions for the service       |

---

## Contract API

### Constructor

```rust
fn __constructor(env: Env, admin: Address, token: Address)
```

Initializes the contract. Sets the admin, token address, and zeroes the service/subscription ID counters. Called once at deployment.

---

### Service Management

#### `register_service`

```rust
fn register_service(
    env: Env,
    merchant: Address,
    name: String,
    price: i128,
    period_secs: u64,
    trial_period_secs: u64,
    approve_periods: u64,
) -> Result<Service, ContractError>
```

Creates a new subscription service.

**Auth:** `merchant`

**Validation:**
- `price > 0` -> `InvalidPrice`
- `period_secs > 0` -> `InvalidPeriod`
- `approve_periods > 0` -> `InvalidPeriod`
- `name` non-empty -> `InvalidServiceName`

**Effects:**
- Stores `Service` under `DataKey::Service(service_id)`
- Appends `service_id` to `DataKey::MerchantServices(merchant)`
- Emits `srv_reg` event

---

### Subscriber Lifecycle

#### `subscribe`

```rust
fn subscribe(
    env: Env,
    subscriber: Address,
    service_id: u64,
    auto_renew: bool,
) -> Result<Subscription, ContractError>
```

Subscribes to a service. Behavior depends on trial period and `auto_renew` flag:

| Scenario                        | Immediate Payment | Token Approval             |
|---------------------------------|-------------------|----------------------------|
| No trial, `auto_renew=true`    | Yes (1 period)    | `approve_periods` periods  |
| No trial, `auto_renew=false`   | Yes (1 period)    | 1 period                   |
| Trial, `auto_renew=true`       | No                | `approve_periods` periods  |
| Trial, `auto_renew=false`      | No                | None                       |

**Auth:** `subscriber`

**Deduplication:** Rejects with `AlreadySubscribed` if the subscriber has an active subscription to the same service, unless the previous subscription has expired **and** `auto_renew=false`.

**Trial abuse prevention:** If the subscriber previously used a free trial for this service, re-subscribing with `auto_renew=false` to a trial service is blocked. The subscriber must set `auto_renew=true` (committing to paid renewal after the trial).

**Effects:**
- Stores `Subscription` under `DataKey::Sub(sub_id)`
- Updates index keys: `SubscriberSubs`, `ServiceSubs`, `SubServicePair`
- Calls `token.approve()` before `token.transfer()` (approval is pre-authorized)
- Emits `sub`, `approve`, and optionally `low_bal` events

---

#### `cancel`

```rust
fn cancel(env: Env, subscriber: Address, sub_id: u64) -> Result<(), ContractError>
```

Cancels auto-renewal. The subscription remains active until `service_end_ts`.

**Auth:** `subscriber` (must own the subscription)

**Validation:**
- `AlreadyCancelled` if `auto_renew` is already `false`

**Effects:**
- Sets `auto_renew = false`
- Emits `cancel` event with remaining seconds

---

#### `toggle_auto_renew`

```rust
fn toggle_auto_renew(
    env: Env,
    subscriber: Address,
    sub_id: u64,
) -> Result<bool, ContractError>
```

Toggles the `auto_renew` flag. When re-enabling (`false -> true`), refreshes the token approval.

**Auth:** `subscriber` (must own the subscription)

**Validation:**
- `SubscriptionExpired` if re-enabling on a fully expired subscription

**Effects:**
- Flips `auto_renew`
- If re-enabled: calls `token.approve()` for `approve_periods`
- Emits `renew` event

---

#### `extend_subscription`

```rust
fn extend_subscription(
    env: Env,
    subscriber: Address,
    sub_id: u64,
) -> Result<Subscription, ContractError>
```

Refreshes the token approval on an active subscription (useful when the original approval is about to expire).

**Auth:** `subscriber` (must own the subscription)

**Validation:**
- `SubscriptionExpired` if `service_end_ts <= now`

**Effects:**
- Sets `auto_renew = true`
- Calls `token.approve()` for `approve_periods`
- Emits `extend` and `approve` events

---

### Merchant Operations

#### `process`

```rust
fn process(
    env: Env,
    merchant: Address,
    service_id: u64,
    offset: u32,
    limit: u32,
) -> Result<ProcessResult, ContractError>
```

Batch-charges due subscriptions for a service. This is the core billing function.

**Auth:** `merchant` (must own the service via `NotServiceOwner` check)

**Pagination:** Soroban transactions have finite resource limits (read/write ledger entries and bytes per transaction). Large subscriber sets must be processed in batches using `offset` and `limit`. The returned `ProcessResult.total` indicates the total number of subscriptions, allowing the caller to determine how many batches are needed.

**Example batch loop:**
```
// Process 20 subscriptions per transaction
batch 1: process(merchant, service_id, 0, 20)   -> total=55
batch 2: process(merchant, service_id, 20, 20)
batch 3: process(merchant, service_id, 40, 20)   -> covers remaining 15
```

**Processing logic for each subscription in the `[offset, offset+limit)` window:**

1. **Skip** if subscription not found in storage -> increment `skipped`
2. **Skip** if `auto_renew == false` (not auto-renewing) -> increment `skipped`
3. **Skip** if `now < next_charge_ts` (not yet due) -> increment `skipped`
4. **Attempt** `token.try_transfer_from(subscriber -> merchant, price)`
   - **Success:**
     - `next_charge_ts += period_secs` (on overflow: sets `auto_renew = false`, increments `failed`, continues)
     - `service_end_ts = next_charge_ts`
     - Emits `charge` event
     - If was in trial period: emits `trl_end` event
     - Checks remaining allowance and balance; emits `low_alw` / `low_bal` if insufficient for next period
     - Increments `charged`
   - **Failure:**
     - Sets `auto_renew = false`
     - Emits `chg_fail` event
     - Increments `failed`

**No charge drift guarantee:** `next_charge_ts` and `service_end_ts` are advanced by exactly `period_secs` from their previous values, not from wall-clock time.

**Failure isolation:** Neither payment failures nor timestamp overflows revert the transaction. Each problematic subscription is individually marked as `auto_renew = false` and the batch continues processing the remaining subscriptions.

---

### Query Functions

All query functions are read-only and are typically called via `simulateTransaction` (no gas cost). They do **not** bump storage TTLs -- TTL extension happens only in mutating functions (`subscribe`, `process`, `cancel`, `toggle_auto_renew`, `extend_subscription`, `register_service`).

#### `get_service`

```rust
fn get_service(env: Env, service_id: u64) -> Result<Service, ContractError>
```

Returns service details. **No auth required.**

---

#### `get_merchant_services`

```rust
fn get_merchant_services(env: Env, merchant: Address) -> Vec<Service>
```

Returns all services registered by a merchant. **No auth required.**

---

#### `get_subscription`

```rust
fn get_subscription(
    env: Env,
    caller: Address,
    sub_id: u64,
) -> Result<Subscription, ContractError>
```

Returns subscription details.

**Auth:** `caller` must be the subscriber **or** the merchant of the service.

---

#### `get_subscriber_subs`

```rust
fn get_subscriber_subs(env: Env, subscriber: Address) -> Vec<Subscription>
```

Returns all subscriptions for a subscriber. Gracefully skips subscriptions that have expired from storage.

**Auth:** `subscriber`

---

#### `get_merchant_subs`

```rust
fn get_merchant_subs(
    env: Env,
    merchant: Address,
    service_id: u64,
) -> Result<Vec<Subscription>, ContractError>
```

Returns all subscriptions for a service. Gracefully skips subscriptions that have expired from storage.

**Auth:** `merchant` (must own the service)

---

#### `is_subscription_active`

```rust
fn is_subscription_active(env: Env, subscriber: Address, service_id: u64) -> bool
```

Returns `true` if a subscription exists and `current_timestamp < service_end_ts`. Returns `false` if the subscription or index entry is not found. **No auth required.**

---

### Admin Functions

#### `upgrade`

```rust
fn upgrade(env: Env, new_wasm_hash: BytesN<32>)
```

Replaces the contract WASM code.

**Auth:** `admin`

---

#### `version`

```rust
fn version(_env: Env) -> u32
```

Returns the current contract version number (currently `1`). **No auth required.**

---

## Payment Flow

### Token Approval Model

The contract uses the Stellar token `approve` + `transfer_from` pattern for recurring charges:

1. On `subscribe()`, `toggle_auto_renew(true)`, or `extend_subscription()`, the contract calls `token.approve()` on behalf of the subscriber, granting the contract an allowance of `price * approve_periods` (using checked multiplication to prevent overflow).
2. The approval expiration ledger is calculated as: `current_ledger + ((period_secs * approve_periods + extra_secs) / 5)`, capped at the network's max TTL. For trial subscriptions, `extra_secs` includes `trial_period_secs` to ensure the approval doesn't expire before the trial ends.
3. In the no-trial case, `token.approve()` is called **before** `token.transfer()` so the contract is pre-authorized.
4. On each `process()` cycle, the contract calls `token.try_transfer_from()` to pull `price` from the subscriber to the merchant.
5. When the approval is running low (remaining allowance < price), a `low_alw` event is emitted to signal that the subscriber should call `extend_subscription()`.

### Charge Timeline Example

```
subscribe(auto_renew=true, trial=7d, period=30d)
  |
  |--- Day 0: No payment. Approval granted for N periods.
  |
  |--- Day 7 (trial ends): process() charges first period.
  |                         Emits "trl_end" + "charge".
  |                         service_end_ts = day 7 + 30d = day 37
  |                         next_charge_ts = day 7 + 30d = day 37
  |
  |--- Day 37: process() charges second period.
  |             service_end_ts = day 67
  |             next_charge_ts = day 67
  |
  |--- Day 67: process() charges third period...
```

---

## Access Control

| Function              | Requires Auth | Who Can Call                        |
|-----------------------|---------------|-------------------------------------|
| `register_service`    | Yes           | `merchant`                          |
| `subscribe`           | Yes           | `subscriber`                        |
| `cancel`              | Yes           | `subscriber` (own subscription)     |
| `toggle_auto_renew`   | Yes           | `subscriber` (own subscription)     |
| `extend_subscription` | Yes           | `subscriber` (own subscription)     |
| `process`             | Yes           | `merchant` (own service)            |
| `get_subscription`    | Yes           | `subscriber` or `merchant` of the subscription's service |
| `get_subscriber_subs` | Yes           | `subscriber`                        |
| `get_merchant_subs`   | Yes           | `merchant` (own service)            |
| `get_service`         | No            | Anyone                              |
| `get_merchant_services`| No           | Anyone                              |
| `is_subscription_active`| No          | Anyone                              |
| `upgrade`             | Yes           | `admin`                             |
| `version`             | No            | Anyone                              |

All authenticated functions use `require_auth()` and verify the caller matches the expected role. Mismatches return `ContractError::Unauthorized` or `ContractError::NotServiceOwner`.

---

## Events

| Symbol     | Description                     | Data                                                   |
|------------|---------------------------------|--------------------------------------------------------|
| `srv_reg`  | Service registered              | `Service` struct                                       |
| `sub`      | Subscription created            | `(subscriber, service_id, sub_id)`                     |
| `cancel`   | Subscription cancelled          | `(subscriber, sub_id, service_id, remaining_secs)`     |
| `renew`    | Auto-renewal toggled            | `(subscriber, sub_id, service_id, auto_renew)`         |
| `extend`   | Subscription approval extended  | `(subscriber, sub_id, service_id)`                     |
| `approve`  | Token approval granted          | `(subscriber, service_id, amount, expiration_ledger, token)` |
| `charge`   | Successful payment              | `(subscriber, service_id, price)`                      |
| `trl_end`  | Trial period ended (first charge) | `(subscriber, service_id, sub_id)`                   |
| `chg_fail` | Payment or timestamp overflow failed | `(subscriber, service_id, sub_id)`                |
| `low_alw`  | Allowance insufficient for next period | `(subscriber, service_id, remaining, required)`   |
| `low_bal`  | Balance insufficient for next period   | `(subscriber, service_id, balance, required)`     |
| `upgrade`  | Contract WASM upgraded          | `new_wasm_hash`                                        |

---

## Error Codes

| Code | Name                  | Meaning                                                  |
|------|-----------------------|----------------------------------------------------------|
| 1    | `InvalidPrice`        | `price <= 0`                                             |
| 2    | `InvalidPeriod`       | `period_secs == 0` or `approve_periods == 0`             |
| 3    | `AlreadySubscribed`   | Active subscription exists for this (subscriber, service) pair, or subscriber is attempting to reuse a free trial without `auto_renew` |
| 4    | `SubscriptionNotFound`| Subscription ID does not exist in storage                |
| 5    | `ServiceNotFound`     | Service ID does not exist in storage                     |
| 6    | `Unauthorized`        | Caller is not the expected subscriber/merchant           |
| 7    | `AlreadyCancelled`    | Subscription `auto_renew` is already `false`             |
| 8    | `TimestampOverflow`   | Arithmetic overflow in timestamp or approval calculation |
| 9    | `NotServiceOwner`     | Merchant does not own the specified service              |
| 10   | `InvalidServiceName`  | Service name is empty                                    |
| 11   | `SubscriptionExpired` | Cannot re-enable or extend a fully expired subscription  |
| 12   | `ServiceNotActive`    | Service exists but `is_active` is `false`                |

---

## Storage Layout & TTL

### Storage Keys

| Key                              | Storage Type | Value Type         | Purpose                          |
|----------------------------------|--------------|--------------------|----------------------------------|
| `Admin`                          | Instance     | `Address`          | Contract administrator           |
| `Token`                          | Instance     | `Address`          | Token contract address           |
| `NextServiceId`                  | Instance     | `u64`              | Service ID counter               |
| `NextSubId`                      | Instance     | `u64`              | Subscription ID counter          |
| `Service(u64)`                   | Persistent   | `Service`          | Service data                     |
| `MerchantServices(Address)`      | Persistent   | `Vec<u64>`         | Service IDs by merchant          |
| `Sub(u64)`                       | Persistent   | `Subscription`     | Subscription data                |
| `SubscriberSubs(Address)`        | Persistent   | `Vec<u64>`         | Subscription IDs by subscriber   |
| `ServiceSubs(u64)`               | Persistent   | `Vec<u64>`         | Subscription IDs by service      |
| `SubServicePair(Address, u64)`   | Persistent   | `u64`              | Dedup index: (subscriber, service) -> sub_id |

### TTL Configuration

| Parameter                  | Value     | Approximate Duration |
|----------------------------|-----------|----------------------|
| `INSTANCE_TTL_THRESHOLD`   | 17,280    | ~1 day (at 5s/ledger)|
| `INSTANCE_TTL_EXTEND`      | 518,400   | ~30 days             |
| `PERSISTENT_TTL_THRESHOLD` | 17,280    | ~1 day               |
| `PERSISTENT_TTL_EXTEND_MIN`| 518,400   | ~30 days (floor)     |

### Dynamic TTL for Persistent Storage

Persistent storage TTL extend is computed dynamically based on the service's billing period:

```
ttl_extend = max(period_secs * 2 / SECS_PER_LEDGER, PERSISTENT_TTL_EXTEND_MIN)
```

This ensures data survives at least **2 full billing periods** between `process()` calls. Without this, a quarterly subscription (90-day period) would lose its data after ~30 days of the fixed TTL, before the next `process()` call.

| Billing Period | TTL Extend | Approximate Duration |
|----------------|------------|----------------------|
| Monthly (30d)  | 518,400    | ~30 days (floor)     |
| Quarterly (90d)| 3,110,400  | ~180 days            |
| Annual (365d)  | 12,614,400 | ~730 days            |

### TTL Bump Strategy

TTL bumps (`bump_persistent`, `bump_instance`) are performed **only in mutating functions** (`subscribe`, `process`, `cancel`, `toggle_auto_renew`, `extend_subscription`, `register_service`). Query functions do **not** bump TTLs because they are typically executed via `simulateTransaction`, where state changes are discarded.

This means persistent data stays alive as long as the service has active interactions (new subscriptions, recurring charges, cancellations). Data for fully inactive services (no subscribers, no process calls) may eventually expire from storage -- this is by design.
