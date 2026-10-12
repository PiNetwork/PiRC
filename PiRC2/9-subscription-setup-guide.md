## 9. Subscription Setup Guide

Contract: CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV
Network: Pi Testnet
RPC: https://rpc.testnet.minepi.com

Environment Setup

1. Install Stellar CLI

# macOS
brew install stellar-cli
# Linux / Windows (WSL)
cargo install --locked stellar-cli --features opt

Full guide: Install the CLI | Stellar Docs

2. Configure Pi Testnet

Create the file ~/.stellar/network/pi-testnet.toml:

rpc_url = "https://rpc.testnet.minepi.com"
rpc_headers = []
network_passphrase = "Pi Testnet"

3. Environment Variables (optional, for convenience)

export CONTRACT_ID=CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV
export NETWORK=pi-testnet

Error Codes

| Code | Name               | Description                                                    |
|------|--------------------|----------------------------------------------------------------|
| 1    | InvalidPrice       | Price must be greater than 0                                   |
| 2    | InvalidPeriod      | Period must be greater than 0; approve_periods must also be > 0|
| 3    | AlreadySubscribed  | Active subscription already exists, or free trial already used |
| 4    | SubscriptionNotFound | No subscription found with the given ID                      |
| 5    | ServiceNotFound    | No service found with the given ID                             |
| 6    | Unauthorized       | Caller is not the owner of the subscription                    |
| 7    | AlreadyCancelled   | Subscription is already cancelled (auto_renew = false)         |
| 8    | TimestampOverflow  | Overflow when computing timestamps                             |
| 9    | NotServiceOwner    | Caller is not the owner of the service                         |
| 10   | InvalidServiceName | Service name cannot be empty                                   |
| 11   | SubscriptionExpired| Subscription has expired                                       |
| 12   | ServiceNotActive   | Service has been deactivated                                   |

Contract Methods

register_service — Register a Service

Creates a new paid service. Called by the merchant.

Parameters:

| Parameter        | Type    | Description                              |
|------------------|---------|------------------------------------------|
| merchant         | Address | Merchant address (requires auth)         |
| name             | String  | Service name (must not be empty)         |
| price            | i128    | Price per period in token units (> 0)    |
| period_secs      | u64     | Period duration in seconds (> 0)         |
| trial_period_secs| u64     | Trial duration in seconds (0 = no trial) |
| approve_periods  | u64     | Number of periods to pre-approve (> 0)   |

Returns: Service object

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- register_service \
  --merchant <MERCHANT_PUBLIC_KEY> \
  --name "Premium Plan" \
  --price 10000000 \
  --period_secs 2592000 \
  --trial_period_secs 604800 \
  --approve_periods 3
```

price is in the smallest token unit. For Pi with 7 decimal places: 10000000 = 1 Pi.

subscribe — Subscribe to a Service

Subscribes a user to a service. Called by the subscriber.

Parameters:

| Parameter  | Type    | Description                              |
|------------|---------|------------------------------------------|
| subscriber | Address | Subscriber address (requires auth)       |
| service_id | u64     | Service ID                               |
| auto_renew | bool    | Enable automatic renewal via process()   |

Behavior matrix:

|               | auto_renew = true                                                                             | auto_renew = false                                                                  |
|---------------|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| With trial    | Approves approve_periods + trial duration. No immediate payment. Charges begin after trial.   | Trial only. No approval, no payment. Expires when trial ends.                       |
| Without trial | Immediately transfers first period + approves approve_periods periods.                        | Immediately transfers first period + approves 1 period. Will not auto-renew.        |

Returns: Subscription object

```bash
# With auto-renewal
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- subscribe \
  --subscriber <SUBSCRIBER_PUBLIC_KEY> \
  --service_id 0 \
  --auto_renew true
```

```bash
# Without auto-renewal (single period or trial only)
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- subscribe \
  --subscriber <SUBSCRIBER_PUBLIC_KEY> \
  --service_id 0 \
  --auto_renew false
```

cancel — Cancel a Subscription

Disables auto-renewal. Any remaining paid time is preserved.

Parameters:

| Parameter  | Type    | Description                              |
|------------|---------|------------------------------------------|
| subscriber | Address | Subscriber address (requires auth)       |
| sub_id     | u64     | Subscription ID                          |

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- cancel \
  --subscriber <SUBSCRIBER_PUBLIC_KEY> \
  --sub_id 0
```

Returns AlreadyCancelled if auto_renew is already false.

toggle_auto_renew — Toggle Auto-Renewal

Flips auto_renew on or off. Cannot be re-enabled on an expired subscription.

Parameters:

| Parameter  | Type    | Description                              |
|------------|---------|------------------------------------------|
| subscriber | Address | Subscriber address (requires auth)       |
| sub_id     | u64     | Subscription ID                          |

Returns: bool — new value of auto_renew

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- toggle_auto_renew \
  --subscriber <SUBSCRIBER_PUBLIC_KEY> \
  --sub_id 0
```

When re-enabling, automatically refreshes the token approval for approve_periods periods.

extend_subscription — Refresh Token Approval

Renews the token allowance without changing the subscription period. Use this when the allowance is running low.

Parameters:

| Parameter  | Type    | Description                              |
|------------|---------|------------------------------------------|
| subscriber | Address | Subscriber address (requires auth)       |
| sub_id     | u64     | Subscription ID                          |

Returns: updated Subscription object

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- extend_subscription \
  --subscriber <SUBSCRIBER_PUBLIC_KEY> \
  --sub_id 0
```

Sets auto_renew = true and issues a fresh approval for approve_periods periods.

process — Process Payments

Charges all due subscribers of a service. Called by the merchant (or an automated service).

Parameters:

| Parameter  | Type    | Description                              |
|------------|---------|------------------------------------------|
| merchant   | Address | Merchant address (requires auth)         |
| service_id | u64     | Service ID                               |
| offset     | u32     | Pagination offset                        |
| limit      | u32     | Number of subscriptions to process       |

Returns: ProcessResult object (charged, failed, skipped, total)

```bash
# Process first 50 subscriptions
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- process \
  --merchant <MERCHANT_PUBLIC_KEY> \
  --service_id 0 \
  --offset 0 \
  --limit 50
```

```bash
# Next page
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- process \
  --merchant <MERCHANT_PUBLIC_KEY> \
  --service_id 0 \
  --offset 50 \
  --limit 50
```

If a payment fails, auto_renew is set to false for that subscription automatically.

Read-Only Queries

get_service — Get a Service

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_service \
  --service_id 0
```

get_merchant_services — List All Services for a Merchant

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- get_merchant_services \
  --merchant <MERCHANT_PUBLIC_KEY>
```

get_subscription — Get a Subscription

Only accessible by the subscriber or the service's merchant.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- get_subscription \
  --caller <CALLER_PUBLIC_KEY> \
  --sub_id 0
```

get_subscriber_subs — List All Subscriptions for a Subscriber

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- get_subscriber_subs \
  --subscriber <SUBSCRIBER_PUBLIC_KEY>
```

get_merchant_subs — List All Subscribers for a Service

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <PRIVATE_KEY> \
  -- get_merchant_subs \
  --merchant <MERCHANT_PUBLIC_KEY> \
  --service_id 0
```

is_subscription_active — Check if a Subscription is Active

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- is_subscription_active \
  --subscriber <SUBSCRIBER_PUBLIC_KEY> \
  --service_id 0
```

Returns true if current_timestamp < service_end_ts.

version — Get Contract Version

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -- version
```

Admin Functions

upgrade — Upgrade Contract WASM

Admin only.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  -s <ADMIN_PRIVATE_KEY> \
  -- upgrade \
  --new_wasm_hash <32_BYTE_HASH_HEX>
```

Typical Flow

```
1. Merchant calls register_service
         ↓
2. Subscriber calls subscribe
   (token approval is set automatically)
         ↓
3. When the period ends, merchant calls process
         ↓
4. Contract charges subscribers via transfer_from
         ↓
5. If allowance is running low, subscriber calls extend_subscription
         ↓
6. Subscriber can call cancel or toggle_auto_renew at any time
```

Events

| Topic    | Emitted When              | Payload                                                          |
|----------|---------------------------|------------------------------------------------------------------|
| approve  | Token approval issued     | (subscriber, service_id, amount, expiration_ledger, token)       |
| srv_reg  | Service registered        | Service object                                                   |
| sub      | Subscription created      | (subscriber, service_id, sub_id)                                 |
| cancel   | Subscription cancelled    | (subscriber, sub_id, service_id, remaining_secs)                 |
| renew    | auto_renew toggled        | (subscriber, sub_id, service_id, auto_renew)                     |
| extend   | Approval refreshed        | (subscriber, sub_id, service_id)                                 |
| charge   | Payment succeeded         | (subscriber, service_id, price)                                  |
| chg_fail | Payment failed            | (subscriber, service_id, sub_id)                                 |
| trl_end  | Trial period ended        | (subscriber, service_id, sub_id)                                 |
| low_alw  | Allowance running low     | (subscriber, service_id, remaining_allowance, price)             |
| low_bal  | Balance running low       | (subscriber, service_id, balance, price)                         |
| upgrade  | Contract upgraded         | new_wasm_hash                                                    |
