## 3. Data Types

Amounts are `i128` in the token's smallest unit. Pi has 7 decimal places, so `10000000` = 1 Pi. Times are `u64` ledger timestamps: Unix seconds, UTC. There are no time zones on-chain; only user interfaces convert. Where the contract converts time to ledgers, it uses 5 seconds per ledger, rounding up.

### 3.1 Versioned records

Every stored record is a versioned enum from the first release:

| Stored as | Current variant |
|---|---|
| `ServiceRecord` | `V1(ServiceV1)` |
| `SubRecord` | `V1(SubV1)` |
| `AllowanceRecord` | `V1(AllowanceV1)` |
| `BucketRecord` | `V1(BucketV1)` |
| `BucketPartRecord` | `V1(BucketPartV1)` |

The wallet index (`WalletSubs` pages and `WalletSubCount`) holds plain values. It is append-only and its shape never changes.

Rules for later versions:

- A published variant's struct is frozen. A new field means a new variant (`V2`).
- Reads accept every variant. A record is saved in the newest form the next time it is written.
- Enum variants (`ServiceState`, `SubStatus`, `ChargeOutcome`) and error codes are append-only: never renamed, removed or reused.
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
| `period_secs` | `u64` | Billing period in seconds (> 0). No other limit. |
| `trial_period_secs` | `u64` | Free trial in seconds; 0 = no trial. No limit. |
| `state` | `ServiceState` | The only mutable field |

#### `SubV1`

Stored at `Sub(sub_id)` as `SubRecord::V1`. It is the only source of truth for a subscription. Price and period are read from the service, so the terms cannot change after the subscriber signs.

| Field | Type | Description |
|---|---|---|
| `sub_id` | `u64` | From the `NextSubId` counter |
| `subscriber` | `Address` | The paying wallet |
| `service_id` | `u64` | The service subscribed to |
| `period_end_ts` | `u64` | End of the paid or trial period, and the start of the next charge window |
| `reserved` | `i128` | Approved budget left; always a multiple of `price` |
| `paid_periods` | `u32` | Number of periods paid; 0 during a free trial |

#### `AllowanceV1`

Stored at `Allowance(subscriber)` as `AllowanceRecord::V1`. A small, fixed-size summary per wallet (about 150 bytes). It is deleted when `total` reaches 0.

| Field | Type | Description |
|---|---|---|
| `total` | `i128` | Sum of the item amounts in all of the wallet's buckets. After every subscriber-signed call, the token allowance is set to this value. |
| `clean_through` | `u32` | First day not yet cleaned. Bit 0 of `busy` is this day. |
| `max_close` | `u64` | Latest `final_close` of any subscription added since `total` was last 0. Sets the approve expiry. |
| `busy` | `BytesN<64>` | 512-bit bitmap. Bit `i` (byte `i >> 3`, mask `1 << (i & 7)`) is set if and only if `Bkt(subscriber, clean_through + i)` exists. |
| `far_days` | `Vec<u32>` | Busy days at or beyond `clean_through + 512`, ascending. Rare: only for periods longer than about 512 days. |

The bitmap means the contract never probes empty days.

#### `BucketV1`

Part 0 of a day bucket. Stored at `Bkt(subscriber, day)` as `BucketRecord::V1`.

| Field | Type | Description |
|---|---|---|
| `items` | `Vec<(u64, i128)>` | `(sub_id, amount)` for the wallet's subscriptions whose **current** charge window closes on this UTC day. At most 400 items. Unsorted. |
| `parts` | `u32` | Number of overflow parts for this day. Normally 0. |

#### `BucketPartV1`

An overflow part of a day bucket, used only when one wallet has more than 400 subscriptions whose windows close on the same day. Stored at `BktPart(subscriber, day, k)` for `k = 1 … parts`, as `BucketPartRecord::V1`.

| Field | Type | Description |
|---|---|---|
| `items` | `Vec<(u64, i128)>` | Up to 400 more `(sub_id, amount)` items for the same day. Unsorted. |

A day's bucket is part 0 together with its overflow parts. Every existing part holds at least one item, and a day with no items does not exist. A part is about 180 bytes plus about 40 bytes per item, so a full part (400 items, about 16 KB) stays well under Soroban's 64 KB entry limit. The bitmap in `AllowanceV1` is per day; parts do not appear in it.

#### Wallet index

| Key | Value | Description |
|---|---|---|
| `WalletSubs(subscriber, page: u32)` | `Vec<u64>` | Up to 50 sub ids per page, in creation order. Every subscription the wallet ever created, including ones created by calling the contract directly. Never removed. |
| `WalletSubCount(subscriber)` | `u64` | Number of ids in `WalletSubs`. The last page is `count / 50`, rounded down. |

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
| `ActiveSub(Address, u64)` | persistent | `u64` (`sub_id`) | Most recent subscription for (subscriber, service); the duplicate guard |
| `TrialUsed(Address, u64)` | persistent | `bool` (`true`) | Set once a trial is granted for (subscriber, service) |
| `Executor(u64)` | persistent | `Address` | Optional process-only key for a service; removed when unset |
| `Allowance(Address)` | persistent | `AllowanceRecord` | Per-wallet allowance summary; removed when `total` is 0 |
| `Bkt(Address, u32)` | persistent | `BucketRecord` | Day bucket, part 0: (subscriber, day) |
| `BktPart(Address, u32, u32)` | persistent | `BucketPartRecord` | Day bucket, overflow part: (subscriber, day, k), `k = 1 … parts` |
| `WalletSubs(Address, u32)` | persistent | `Vec<u64>` | Wallet index page: (subscriber, page) |
| `WalletSubCount(Address)` | persistent | `u64` | Wallet index size |

Not stored: status, end reason, names, per-service or per-merchant lists.

#### Days, deadlines and amounts

| Term | Definition |
|---|---|
| `EPOCH` | `1,767,225,600` = 2026-01-01T00:00:00Z, which is day 0. It is already past, so every real deadline falls on day 0 or later. |
| `day(ts)` | `(ts − EPOCH) / 86,400`, rounded down. Times before `EPOCH` count as day 0 (a defensive rule; it does not occur in practice). |
| `today` | `day(now)` |
| `deadline` | `period_end_ts + period_secs`: when the current charge window closes |
| `amount` | `(reserved / price) × price`: the whole-price budget that can still be charged |
| `final_close` | `deadline + (amount / price − 1) × period_secs`: the last window close if every charge lands (only when `amount > 0`) |

Placement rule: every subscription with `amount > 0` has exactly one item, in the bucket of `day(deadline)`: in part 0 or in one overflow part. A subscription with `amount = 0` (no periods budgeted, cancelled, or used up) is in no bucket.

### 3.3 Views and results

Read methods and signed calls return these. They are never stored.

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

#### `AllowanceView`

| Field | Type | Description |
|---|---|---|
| `total` | `i128` | `Allowance.total`: what the next signed call will approve, before cleanup |
| `clean_through_day` | `u32` | `Allowance.clean_through` |
| `pending_days` | `u32` | Number of busy days before `today`: past buckets that the next signed call will clean (up to 40 per call) |
| `max_close` | `u64` | `Allowance.max_close` |

A wallet with no `Allowance` record reads as zeros, with `clean_through_day = today`.

#### `CleanupReport`

Returned by every subscriber-signed call, and emitted as the `cleanup` event when anything was cleaned.

| Field | Type | Description |
|---|---|---|
| `days_cleared` | `u32` | Past days fully released by this call. Each part counts as one page, at most 40 pages per call. |
| `released` | `i128` | Amount removed from `total` |
| `more` | `bool` | Past buckets are still left. The approval is higher than needed until they are cleaned. |

#### `SubscribeResult`

| Field | Type |
|---|---|
| `sub_id` | `u64` |
| `cleanup` | `CleanupReport` |

### 3.4 Billing types

#### `ChargeItem`

| Field | Type | Description |
|---|---|---|
| `sub_id` | `u64` | Subscription to charge |
| `expected_period_end` | `u64` | The `period_end_ts` the caller last saw. If it no longer matches, the item is skipped. |

#### `ChargeOutcome` (enum, append-only)

Only `Charged` changes anything. Every other outcome leaves the subscription and the buckets as they were.

| Variant | Meaning |
|---|---|
| `Charged` | One period paid. The subscription moves to its next day bucket. |
| `NotDue` | `now < period_end_ts` |
| `AlreadyHandled` | `expected_period_end` or `service_id` does not match: already charged, or the wrong service |
| `Stale` | The window closed without a charge. The subscription has ended; cleanup releases its item. |
| `Exhausted` | `reserved < price` |
| `Ended` | The service is `Inactive`, or the subscription has no item in its deadline's day bucket (any part), or the `sub_id` does not exist |
| `ChargeFailed` | The allowance is not 0, but the token refused `transfer_from` (low balance, or an allowance lowered below the price). The subscription stays `Due` and can be retried until its window closes. |
| `ApprovalLost` | The token allowance is 0 (expired or revoked). The subscription stays `Due` and can be retried until its window closes. Any call the subscriber signs re-approves `total`, so a later retry can succeed. |

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
| `cleanup` | `[cleanup, subscriber]` | Every subscriber-signed call that released at least one past day | `CleanupReport` |
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
| `CleanupReport` | `days_cleared: u32`, `released: i128`, `more: bool` |
| `ApprovalEvent` | `amount: i128`, `expiration_ledger: u32` |
| `LowFundsEvent` | `sub_id: u64`, `available: i128` |

Field notes:

- `SubEvent.amount` is the first payment for `sub_new` (0 for a trial), the budget added for `sub_ext`, and the budget released for `sub_cncl`.
- `ChargedEvent.amount` is the price charged. The payee is the service's merchant, fixed by `service_id`, and also named in the token's own `transfer` event.
- `period_end_ts`, `reserved` and `paid_periods` in `SubEvent` and `ChargedEvent` are the values after the change.
- `ApprovalEvent` mirrors the `approve` just made: amount and expiration ledger (both 0 on revoke).
- `LowFundsEvent.available` is the token balance (`low_bal`) or the allowance (`low_alw`) after the charge. The allowance is read once per subscriber per `process` call and lowered by each charge in that call. The `charged` event just before it carries the full resulting state.

`low_bal`, `low_alw` and `charged` are kept small so that a worst-case batch of 15 charges stays under Pi Testnet's 16,384-byte event limit.

There is no "subscription ended" event. A subscription ends by the clock (see [6.8](6-subscription-lifecycle.md#68-status)), not by a call. Off-chain systems read the end from the subscription's state, and the `cleanup` event reports budget released for ended subscriptions in bulk.

Next: [`4-Error-Codes`](4-error-codes.md)
