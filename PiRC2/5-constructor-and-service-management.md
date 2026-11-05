## 5. Constructor and Service Management

### 5.1 Constructor

#### `__constructor(admin: Address, token: Address)`

Runs once, at deploy. Stores the admin and the token, sets `NextServiceId` and `NextSubId` to 0 (so the first `service_id` and the first `sub_id` are 0), and extends the contract instance's TTL.

| Param | Type | Description |
|---|---|---|
| `admin` | `Address` | Contract administrator ([8](8-admin-methods.md)) |
| `token` | `Address` | Payment token: the Pi native token contract. Fixed for the life of the contract. |

### 5.2 Register a service

#### `register_service(merchant: Address, price: i128, period_secs: u64, trial_period_secs: u64) -> u64`

Creates a service in state `Open` and returns its `service_id`. Requires `merchant` authorization.

| Param | Type | Description |
|---|---|---|
| `merchant` | `Address` | Service owner; receives every charge |
| `price` | `i128` | Amount per period (> 0) |
| `period_secs` | `u64` | Billing period in seconds (> 0) |
| `trial_period_secs` | `u64` | Free trial in seconds; 0 = no trial |

The terms are final. To change the price or period, register a new service and close sign-ups on the old one.

Names and descriptions are not stored on-chain. Apps keep them off-chain, keyed by `service_id`.

**Errors:** `InvalidPrice`, `InvalidPeriod`

**Events:** `svc_reg`

The new service starts at the network's minimum TTL. It is extended by the first `subscribe` or charge.

### 5.3 Change service state

#### `set_service_state(merchant: Address, service_id: u64, state: ServiceState)`

Requires `merchant` authorization, and `merchant` must be the service's merchant.

| From \ To | `Open` | `SignupsClosed` | `Inactive` |
|---|---|---|---|
| `Open` | no-op | allowed | allowed |
| `SignupsClosed` | allowed | no-op | allowed |
| `Inactive` | `InvalidStateTransition` | `InvalidStateTransition` | `InvalidStateTransition` |

A no-op succeeds without writing or emitting an event.

Effects:

| State | New sign-ups | Existing subscriptions |
|---|---|---|
| `Open` | allowed | renew normally |
| `SignupsClosed` | `ServiceNotOpen` | renew normally |
| `Inactive` | `ServiceNotOpen` | never charged again; access lasts to `period_end_ts`, then the subscription ends. `extend` returns `SubscriptionEnded`. |

`Inactive` is final. Use it to stop a service for good.

**Errors:** `ServiceNotFound`, `NotServiceOwner`, `InvalidStateTransition`

**Events:** `svc_state` (only when the state changes)

### 5.4 Set the executor

#### `set_executor(merchant: Address, service_id: u64, executor: Option<Address>)`

Sets or removes the service's executor. Requires `merchant` authorization, and `merchant` must be the service's merchant. Pass `None` to remove it (the `Executor(service_id)` key is deleted). A service has at most one executor; setting a new one replaces the old one.

The executor is a process-only key. It can call `process` for this service. It cannot change the service, set another executor, or redirect funds: every charge goes to the service's `merchant`. A merchant can keep the executor key on a billing server and keep the merchant key offline.

**Errors:** `ServiceNotFound`, `NotServiceOwner`

**Events:** `exec_set`. Its `executor` field is a `Vec<Address>`: one element when set, empty when removed.

Next: [`6-Subscription-Lifecycle`](6-subscription-lifecycle.md)
