## 1. Introduction

This PiRC2 requests comments on the design and reference implementation (source code) of **subscription support**, Pi Network's first smart contract capability.

Subscriptions are one of the most common business models today, but they have been hard to build on blockchains. The subscription contract lets developers and businesses add recurring payments to their apps, settle each payment on-chain, and leave subscribers in control of their funds.

The reference implementation is in [`PiCoreTeam/pi-smartcontracts`](https://github.com/PiCoreTeam/pi-smartcontracts) under `contracts/subscription/` (PR #5). We ask the community to review the code and help find bugs or vulnerabilities.

### 1.1 What the contract does

The contract keeps the terms, state and money rules of every subscription. It:

- stores each service's terms (merchant, price, billing period, free trial) and whether it is open for sign-ups;
- stores each subscription's current period end, remaining budget and number of paid periods;
- decides who may call what, for every caller, including direct RPC calls;
- charges a subscription at most once per billing period, and only inside that period's window;
- at every subscriber signature, adds the new budget to (or removes a cancelled budget from) that subscriber's token allowance;
- bounds every charge by the subscription's own budget and window, whatever the shared allowance says;
- keeps an append-only index of every subscription each wallet created, so subscriptions created by calling the contract directly can be found.

It does not store names, descriptions, per-service or per-merchant lists, history or status labels. Those live off-chain. Status is computed from the stored fields and the clock when it is read. Payment history comes from the chain's transaction history.

### 1.2 How it works: non-custodial billing

A subscriber approves a budget, for example "4 months at 5 Pi". The funds stay in the subscriber's wallet. Nothing is locked or sent to the contract. Each period the merchant asks the contract to collect one period's price, and the contract moves that amount from the subscriber's wallet to the merchant. No new signature is needed for each charge.

This uses Soroban's token allowance. The subscriber `approve`s the contract as a spender for an amount and until an expiry ledger. The contract can then call `transfer_from` up to that amount.

The Pi token keeps **one allowance per (subscriber, contract)**, shared by all of that subscriber's subscriptions in this contract. The contract tracks a separate budget, `reserved`, for each subscription, and every charge is bounded by it. When the subscriber signs a call, the contract reads the token's current allowance and approves that value plus the new budget (`subscribe`, `extend`) or minus the cancelled budget (`cancel`). See [6.6 The shared allowance](6-subscription-lifecycle.md#66-the-shared-allowance).

As long as the wallet holds enough Pi when a charge comes due, the subscription renews.

### 1.3 Use cases

Subscriptions for AI products, productivity tools, digital content and memberships, streaming, e-commerce, and local commerce memberships.

### 1.4 What changed from the earlier draft

The contract in this version is a new deployment. It does not upgrade or migrate the contract described by the earlier draft. Services and subscriptions on the earlier contract are not carried over.

| Earlier draft | This version |
|---|---|
| `pay_upfront` / `auto_renew` flag and `toggle_pay_upfront` | No flag. A subscription renews while its `reserved` budget covers the price. `cancel` sets `reserved` to 0. |
| `approve_periods` set by the merchant on the service | The subscriber picks `periods` at `subscribe` and can add more with `extend` |
| `process(merchant, service_id)` walks a stored list | `process(caller, service_id, items)` takes explicit `sub_id`s, each with the `expected_period_end` it expects; at most 15 per call |
| Only the merchant can bill | The merchant or a process-only executor key can bill |
| Allowance only ever added to | Allowance adjusted on top of the token's current value: plus the budget added, minus the budget cancelled, expiry always at the cap. Each charge is bounded by its subscription's own budget. |
| Subscription and service lists on-chain; `get_subscriber_subs`, `get_merchant_subs`, `get_merchant_services` | No per-service or per-merchant lists. Per wallet: an append-only index of every `sub_id` the wallet created (`get_wallet_sub_ids`) |
| `name`, `is_active`, `created_at`, `next_charge_ts`, `service_end_ts`, price copied into each subscription | Service holds only its terms and `state`; subscription holds `period_end_ts`, `reserved`, `paid_periods` and its creation time `created_ts` |
| Service `is_active` | `state`: `Open`, `SignupsClosed` or `Inactive` (final) |
| Stored status | Status derived when read: `Trial`, `Paid`, `Due`, `Ended` |
| Bare structs in storage | Versioned records (`V1`), append-only enums and error codes |
| `upgrade` applied at once | Two-step admin handover and a 7-day upgrade timelock |
| `version()` returned 3 | New contract; `version()` returns 1 |

### 1.5 How apps use it

Most apps do not call the contract directly. A Pi Browser app starts a subscription with the Pi SDK:

```javascript
await Pi.Subscriptions.subscribe(serviceId, { periods: 4 });
```

The Pi Wallet builds the `subscribe` call, shows the terms read from the transaction, and asks the user to sign. Subscriptions created by calling the contract directly are valid on-chain and follow every rule in this document, but Pi's apps and services do not know about them. The SDK documentation covers this.

Next: [`2-Overview`](2-overview.md)
