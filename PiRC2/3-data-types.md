## 3. Data Types

Amounts are `i128` in the token's smallest unit. Pi has 7 decimal places, so `10000000` = 1 Pi. Times are `u64` ledger timestamps in seconds. Where the contract converts time to ledgers, it uses 5 seconds per ledger, rounding up.

### 3.1 Versioned records

Every stored record is a versioned enum from the first release:

| Stored as | Current variant |
|---|---|
| `ServiceRecord` | `V1(ServiceV1)` |
| `SubRecord` | `V1(SubV1)` |
| `PoolRecord` | `V1(PoolV1)` |

Rules for later versions:

- A published variant's struct is frozen. A new field means a new variant (`V2`).
- Reads accept every variant. A record is saved in the newest form the next time it is written.
- Enum variants (`ServiceState`, `SubStatus`, `ChargeOutcome`, `EndReason`) and error codes are append-only: never renamed, removed or changed.
- Public read methods return view structs (3.3), never the stored record. New data gets a new method; existing signatures never change.
- Event payloads are maps (structs), so new fields can be added as new keys.

Off-chain decoders should read fields by name and tolerate unknown fields and variants.

### 3.2 Stored types

#### `ServiceState` (enum, append-only)

| Variant | New sign-ups | Charges |
|---|---|---|
| `Open` | yes | yes |
| `SignupsClosed` | no | yes: existing subscriptions keep renewing |
| `Inactive` | no | no: existing subscriptions run to `period_end_ts`, then end |

`subscribe` requires `Open` exactly. A state added later is not open for sign-ups unless new code says so.

#### `ServiceV1`

Stored at `Service(service_id)` as `ServiceRecord::V1`. Terms never change; only `state` does.

| Field | Type | Description |
|---|---|---|
| `service_id` | `u64` | From the `NextServiceId` counter |
| `merchant` | `Address` | Service owner; receives every charge |
| `price` | `i128` | Amount charged per period (> 0) |
| `period_secs` | `u64` | Billing period in seconds (> 0) |
| `trial_period_secs` | `u64` | Free trial in seconds; 0 = no trial |
| `state` | `ServiceState` | The only mutable field |

#### `SubV1`

Stored at `Sub(sub_id)` as `SubRecord::V1`. Price and period are read from the service, so the terms cannot change after the subscriber signs.

| Field | Type | Description |
|---|---|---|
| `sub_id` | `u64` | From the `NextSubId` counter |
| `subscriber` | `Address` | The paying wallet |
| `service_id` | `u64` | The service subscribed to |
| `period_end_ts` | `u64` | End of the paid or trial period, and the start of the next charge window |
| `reserved` | `i128` | Approved budget left; always a multiple of `price` |
| `paid_periods` | `u32` | Number of periods paid; 0 during a free trial |

#### `PoolV1`

Stored at `Pool(subscriber)` as `PoolRecord::V1`.

| Field | Type | Description |
|---|---|---|
| `live` | `Vec<u64>` | The subscriber's subscriptions that can still be charged, in ascending `sub_id`; at most 50 |

The Pool is rewritten only when `live` changes. A successful charge never changes it. When `live` becomes empty, the key is removed instead of storing an empty list.

Ids leave the Pool only when the subscription has ended, or when it is cancelled. Every live subscription with budget is in its subscriber's Pool. `process` charges only Pool members, as a backstop.

#### `PendingUpgrade`

| Field | Type | Description |
|---|---|---|
| `wasm_hash` | `BytesN<32>` | Hash of the proposed contract WASM |
| `apply_after_ts` | `u64` | Earliest time `apply_upgrade` may run: proposal time + 7 days |

#### `DataKey`

| Key | Storage | Value | Purpose |
|---|---|---|---|
| `Admin` | instance | `Address` | Current admin |
| `PendingAdmin` | instance | `Address` | Proposed admin, until accepted |
| `PendingUpgrade` | instance | `PendingUpgrade` | Proposed upgrade, until applied or cancelled |
| `Token` | instance | `Address` | Pi native token contract; fixed at deploy |
| `NextServiceId` | instance | `u64` | Id counter; starts at 0 |
| `NextSubId` | instance | `u64` | Id counter; starts at 0 |
| `Service(u64)` | persistent | `ServiceRecord` | Service by `service_id` |
| `Sub(u64)` | persistent | `SubRecord` | Subscription by `sub_id` |
| `Pool(Address)` | persistent | `PoolRecord` | Live subscription ids per subscriber; removed when empty |
| `ActiveSub(Address, u64)` | persistent | `u64` (`sub_id`) | Most recent subscription for (subscriber, service); read only by `subscribe` and `get_active_sub` |
| `TrialUsed(Address, u64)` | persistent | `bool` (`true`) | Set once a trial is granted for (subscriber, service) |
| `Executor(u64)` | persistent | `Address` | Optional process-only key for a service; removed when unset |

Not stored: status, end reason, names, per-service or per-merchant lists.

### 3.3 Views

Read methods return these. They are never stored.

#### `SubStatus` (enum, append-only)

| Variant | Condition |
|---|---|
| `Trial` | `now < period_end_ts` and `paid_periods == 0` |
| `Paid` | `now < period_end_ts` and `paid_periods > 0` |
| `Due` | `now >= period_end_ts` and the subscription has not ended: `now < period_end_ts + period_secs` and `reserved >= price` and service `state != Inactive` |
| `Ended` | otherwise |

#### `SubscriptionView`

| Field | Type | Description |
|---|---|---|
| `sub_id` | `u64` | As stored |
| `subscriber` | `Address` | As stored |
| `service_id` | `u64` | As stored |
| `period_end_ts` | `u64` | As stored |
| `reserved` | `i128` | As stored |
| `paid_periods` | `u32` | As stored |
| `status` | `SubStatus` | Derived at read time from the stored fields, the service and the clock |

`status` does not look at the token. A `Due` subscription whose allowance has expired or been revoked still reads `Due`; its charge returns `ApprovalLost` until the subscriber signs any call. To know whether the next charge can land, read the token's allowance entry (`["Allowance", {from, spender}]` → `{amount, live_until_ledger}`) for its amount and expiry.

#### `ServiceView`

| Field | Type |
|---|---|
| `service_id` | `u64` |
| `merchant` | `Address` |
| `price` | `i128` |
| `period_secs` | `u64` |
| `trial_period_secs` | `u64` |
| `state` | `ServiceState` |

#### `PoolView`

| Field | Type | Description |
|---|---|---|
| `live` | `Vec<u64>` | The stored Pool with ended ids filtered out |
| `live_sum` | `i128` | Sum of `(reserved / price) × price` over `live` |

### 3.4 Billing types

#### `ChargeItem`

| Field | Type | Description |
|---|---|---|
| `sub_id` | `u64` | Subscription to charge |
| `expected_period_end` | `u64` | The `period_end_ts` the caller last saw. If it no longer matches, the item is skipped. |

#### `ChargeOutcome` (enum, append-only)

| Variant | Meaning | Pool |
|---|---|---|
| `Charged` | One period paid | unchanged |
| `NotDue` | `now < period_end_ts` | unchanged |
| `AlreadyHandled` | `expected_period_end` or `service_id` does not match: already charged, or the wrong service | unchanged |
| `Stale` | The window closed without a charge | id dropped |
| `Exhausted` | `reserved < price` | id dropped |
| `Ended` | Service is `Inactive` (id dropped), or the id is not in the Pool, or the `sub_id` does not exist (nothing to drop) | see meaning |
| `ChargeFailed` | The allowance is not 0, but the token refused `transfer_from` (low balance, or an allowance lowered below the price). Nothing changes; the subscription stays `Due` and can be retried until its window closes. | unchanged |
| `ApprovalLost` | The token allowance is 0 (expired or revoked). Nothing changes; the subscription stays `Due` and can be retried until its window closes. Any call the subscriber signs re-approves the live sum, so a later retry can succeed. | unchanged |

#### `ItemResult`

| Field | Type |
|---|---|
| `sub_id` | `u64` |
| `outcome` | `ChargeOutcome` |

`process` returns one `ItemResult` per input item, in order.

### 3.5 Events

Every event payload is a struct (a map), except `upgrade` and `admin`, which are tuples.

| Kind | Topics | Emitted by | Payload |
|---|---|---|---|
| `svc_reg` | `[svc_reg, merchant]` | `register_service` | `ServiceRegisteredEvent` |
| `svc_state` | `[svc_state, merchant]` | `set_service_state`, only when the state changes | `ServiceStateEvent` |
| `exec_set` | `[exec_set, merchant]` | `set_executor` | `ExecutorEvent` |
| `sub_new` | `[sub_new, subscriber]` | `subscribe` | `SubEvent` |
| `sub_ext` | `[sub_ext, subscriber]` | `extend` | `SubEvent` |
| `sub_cncl` | `[sub_cncl, subscriber]` | `cancel`, only when it releases budget | `SubEvent` |
| `charged` | `[charged, subscriber]` | `process`, on each successful charge | `ChargedEvent` |
| `sub_end` | `[sub_end, subscriber]` | `process` only, when it actually removes an id from the Pool | `SubEndEvent` |
| `approval` | `[approval, subscriber]` | Every subscriber-signed call (`subscribe`, `extend`, `cancel`, `refresh_approval`) | `ApprovalEvent` |
| `low_bal` | `[low_bal, subscriber]` | `process`, after a charge, when the balance is below `price` | `LowFundsEvent` |
| `low_alw` | `[low_alw, subscriber]` | `process`, after a charge, when the allowance is below `price` | `LowFundsEvent` |
| `upgrade` | `[upgrade]` | `propose_upgrade`, `apply_upgrade`, `cancel_upgrade` | `(phase: Symbol, wasm_hash: BytesN<32>)`, phase `propose`, `apply` or `cancel` |
| `admin` | `[admin]` | `propose_admin`, `accept_admin` | `(phase: Symbol, new_admin: Address)`, phase `propose` or `accept` |

Payload structs:

| Struct | Fields |
|---|---|
| `ServiceRegisteredEvent` | `service_id: u64`, `price: i128`, `period_secs: u64`, `trial_period_secs: u64`, `state: ServiceState` |
| `ServiceStateEvent` | `service_id: u64`, `state: ServiceState` |
| `ExecutorEvent` | `service_id: u64`, `executor: Vec<Address>`: one element when set, empty when removed |
| `SubEvent` | `sub_id: u64`, `service_id: u64`, `amount: i128`, `period_end_ts: u64`, `reserved: i128`, `paid_periods: u32` |
| `ChargedEvent` | `sub_id: u64`, `service_id: u64`, `amount: i128`, `period_end_ts: u64`, `reserved: i128`, `paid_periods: u32` |
| `SubEndEvent` | `sub_id: u64`, `service_id: u64`, `reason: EndReason`, `period_end_ts: u64`, `reserved: i128`, `paid_periods: u32` |
| `ApprovalEvent` | `amount: i128`, `expiration_ledger: u32`, `live: Vec<u64>` |
| `LowFundsEvent` | `sub_id: u64`, `available: i128` |

Field notes:

- `SubEvent.amount` is the first payment for `sub_new` (0 for a trial), the budget added for `sub_ext`, and the budget released for `sub_cncl`.
- `ChargedEvent.amount` is the price charged. The payee is the service's merchant, fixed by `service_id`, and also named in the token's own `transfer` event.
- `period_end_ts`, `reserved` and `paid_periods` in `SubEvent`, `ChargedEvent` and `SubEndEvent` are the values after the change.
- `ApprovalEvent` mirrors the `approve` just made: amount, expiration ledger (0 on revoke) and the live ids.
- `LowFundsEvent.available` is the token balance (`low_bal`) or the allowance (`low_alw`) after the charge. The allowance is read once per subscriber per `process` call and lowered by each charge in that call. The `charged` event just before it carries the full resulting state.

`low_bal`, `low_alw` and `charged` are kept small so that a worst-case batch of 15 charges stays under Pi Testnet's 16,384-byte event limit.

#### `EndReason` (enum, append-only)

| Variant | Emitted when |
|---|---|
| `Stale` | `process` found the window closed |
| `Exhausted` | `process` found `reserved < price` |
| `ChargeFailed` | Reserved. Not emitted: a failed charge does not end or drop a subscription. |
| `ServiceInactive` | `process` found the service `Inactive` |

Why a subscription ended is never stored. It comes from these events. Subscriptions that end without a `process` call (for example, cancelled ones) emit no `sub_end`; `sync_pool` drops them silently.

Next: [`4-Error-Codes`](4-error-codes.md)
