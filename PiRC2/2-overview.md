## 2. Overview

A Soroban smart contract for **recurring payments** on Pi Network. Merchants register services with a fixed price and billing period. Subscribers subscribe with a budget of whole periods. The merchant, or its executor, collects each period's payment from the subscriber's token allowance.

```mermaid
flowchart LR
  M[Merchant] -->|register_service<br/>set_service_state<br/>set_executor| C[Subscription contract]
  S[Subscriber] -->|subscribe / extend<br/>cancel / refresh_approval| C
  E[Merchant or executor] -->|process| C
  C -->|approve: set allowance| T[Pi token]
  C -->|transfer: first period<br/>transfer_from: renewals| T
  T -->|price per period| M
```

### 2.1 Roles

| Role | Who | Can do |
|---|---|---|
| Merchant | The address that registered a service; receives every charge | `register_service`, `set_service_state`, `set_executor`, `process` for its own services |
| Subscriber | The wallet that pays | `subscribe`, `extend`, `cancel`, `refresh_approval` for its own subscriptions |
| Executor | An optional key the merchant sets per service | `process` for that service only. It cannot change the service or receive funds. |
| Admin | Set at deploy | Propose and accept a new admin; propose, apply and cancel upgrades (7-day timelock) |

Anyone can call the read methods.

### 2.2 Key concepts

**Service terms are immutable.** A service's `merchant`, `price`, `period_secs` and `trial_period_secs` never change after `register_service`. A new price means a new service. Only `state` changes.

**Service state.** `Open` accepts sign-ups. `SignupsClosed` refuses new sign-ups, but existing subscriptions keep renewing. `Inactive` is final: no sign-ups and no charges; existing subscriptions run to their `period_end_ts` and then end.

**Period windows.** Each subscription has a `period_end_ts`: the end of the paid (or trial) period. The next charge may land only in the window `[period_end_ts, period_end_ts + period_secs)`. A charge moves `period_end_ts` forward by exactly `period_secs`, counting from the old value, not from the time of the charge. Windows are back to back, so at most one charge lands per period and billing never drifts. If no charge lands before the window closes, the subscription has ended.

**Reserved budget.** Each subscription has `reserved`: the approved budget it can still spend, always a whole number of prices. `subscribe` and `extend` add `price × periods`. Each charge takes one `price`. `cancel` sets it to 0. A subscription renews only while `reserved >= price`. The first payment at `subscribe` is a direct transfer and does not come from `reserved`.

**Pool and allowance sync.** The Pi token holds one allowance per (subscriber, contract), and only the subscriber's signature can change it. Each subscriber has a `Pool`: the ids of their subscriptions that can still be charged, at most 50. Every call the subscriber signs drops ended ids from the Pool, then **sets** the allowance to the sum of the remaining budgets, expiring shortly after the last of them would run out. If the allowance has dropped to 0 (expired or revoked), the call instead drops every id from the Pool (the approval gate), and each subscription comes back only through `extend`. Being in the Pool is what lets a subscription be charged. Between signatures the allowance can be larger than the live budgets need. That leftover cannot be spent. Details in [6.6](6-subscription-lifecycle.md#66-keeping-the-allowance-in-sync).

**Explicit billing.** `process` takes up to 15 items, each a `sub_id` with the `period_end_ts` the caller expects. If that value has already moved, the item is skipped. So a retried or duplicated batch charges nothing twice.

**Guardrails on-chain.** One live subscription per (subscriber, service); an ended subscription can never be extended. One free trial per (subscriber, service), ever. Sign-ups only on `Open` services. These hold for every caller.

**Derived status.** Status is never stored. Reads compute `Trial`, `Paid`, `Due` or `Ended` from the stored fields and the current time.

**Versioned records.** Every stored record is a versioned enum (`V1` today). Enum variants and error codes are append-only. Read methods return view structs, never the stored record. This lets later versions add fields without breaking stored data.

### 2.3 Subscribe

```mermaid
flowchart TD
  A[subscribe<br/>subscriber, service_id, periods, claim_trial] --> B{Service exists?}
  B -- no --> E1[ServiceNotFound]
  B -- yes --> C{state == Open?}
  C -- no --> E2[ServiceNotOpen]
  C -- yes --> D{ActiveSub points to<br/>a sub that has not ended?}
  D -- yes --> E3[AlreadySubscribed]
  D -- no --> F[sync_pool]
  F --> G{Pool has fewer<br/>than 50 ids?}
  G -- no --> E4[PoolFull]
  G -- yes --> RS["reserved = price × periods"]
  RS --> H{claim_trial and<br/>trial_period_secs > 0?}
  H -- yes --> I{TrialUsed set?}
  I -- no --> T["Trial<br/>period_end_ts = now + trial_period_secs<br/>paid_periods = 0<br/>set TrialUsed"]
  I -- yes --> P
  H -- no --> P["First payment<br/>transfer price: subscriber to merchant<br/>period_end_ts = now + period_secs<br/>paid_periods = 1"]
  T --> R["save sub, set ActiveSub<br/>add sub_id to Pool"]
  P --> R
  R --> AP["approve: set allowance to live sum<br/>event sub_new<br/>return sub_id"]
```

`TrialUsed` is read only when `claim_trial` is true and the service has a trial.

### 2.4 Process: the charge rule

`process(caller, service_id, items)` first checks the call as a whole, then applies this rule to each item in order. The first check that fails decides the item's outcome. One item never makes the whole call fail.

```mermaid
flowchart TD
  A[process<br/>caller, service_id, items] --> A1{items <= 15?}
  A1 -- no --> X1[ProcessLimitTooHigh]
  A1 -- yes --> AU[caller.require_auth]
  AU --> A0{service exists?}
  A0 -- no --> X0[ServiceNotFound]
  A0 -- yes --> A2{caller is merchant<br/>or executor?}
  A2 -- no --> X2[NotProcessExecutor]
  A2 -- yes --> L[For each item]
  L --> S0{sub exists?}
  S0 -- no --> O0[Ended]
  S0 -- yes --> S1{sub.service_id matches and<br/>period_end_ts == expected_period_end?}
  S1 -- no --> O1[AlreadyHandled<br/>no change]
  S1 -- yes --> S2{now < period_end_ts?}
  S2 -- yes --> O2[NotDue]
  S2 -- no --> S3{now >= period_end_ts + period_secs?}
  S3 -- yes --> O3[Stale<br/>drop from Pool]
  S3 -- no --> S4{reserved < price?}
  S4 -- yes --> O4[Exhausted<br/>drop from Pool]
  S4 -- no --> S5{service Inactive?}
  S5 -- yes --> O5[Ended<br/>drop from Pool]
  S5 -- no --> S5b{id in Pool?}
  S5b -- no --> O5b[Ended]
  S5b -- yes --> S5c{allowance == 0?}
  S5c -- yes --> O5c[ApprovalLost<br/>drop from Pool]
  S5c -- no --> S6{transfer_from succeeds?}
  S6 -- no --> O6[ChargeFailed<br/>no change, retried later]
  S6 -- yes --> O7["Charged<br/>period_end_ts += period_secs<br/>reserved -= price<br/>paid_periods += 1"]
```

### 2.5 Status

```mermaid
flowchart TD
  A[Read a subscription] --> B{now < period_end_ts?}
  B -- yes --> C{paid_periods == 0?}
  C -- yes --> TR[Trial]
  C -- no --> PA[Paid]
  B -- no --> D{"now < period_end_ts + period_secs<br/>and reserved >= price<br/>and service not Inactive?"}
  D -- yes --> DU[Due]
  D -- no --> EN[Ended]
```

`Trial`, `Paid` and `Due` count as active. `Ended` is final: an ended subscription is never charged or extended again. To continue, the subscriber subscribes again. `status` is computed from the stored fields only: a subscription dropped from the Pool by the approval gate can still read `Paid` or `Due`, but it is not charged until `extend` puts it back. A cancelled subscription is not ended until its `period_end_ts`, and `extend` before then undoes the cancel.

### 2.6 Security

See [`10-security-considerations`](10-security-considerations.md) for who can spend the allowance, what the token and the contract each enforce, storage expiry, executor keys and upgrades.

Next: [`3-Data-Types`](3-data-types.md)
