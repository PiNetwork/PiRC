## 6. Subscription Lifecycle

### 6.1 Subscribe

#### `subscribe(subscriber, service_id, pay_upfront) -> Subscription`

Creates a subscription. Requires `subscriber` authorization. Behavior depends on trial period and `pay_upfront`:

|  | `pay_upfront = true` | `pay_upfront = false` |
|---|---|---|
| **With trial** | No immediate payment. Approves token for `approve_periods` future periods. After trial, `process()` charges each cycle. | Trial only. No approval, no payment. Subscription expires when the trial ends. |
| **Without trial** | Immediately transfers 1st period price. Approves token for `approve_periods` future periods. `process()` charges each cycle. | Immediately transfers 1st period price. Approves token for 1 period. `process()` skips this subscription; expires after the paid period unless extended via `extend_subscription`. |

**Errors:** `ServiceNotFound`, `AlreadySubscribed`, `TimestampOverflow`

**Events:** `sub`, `approve`, `low_bal` (if balance < price)

### 6.2 Cancel

#### `cancel(subscriber, sub_id)`

Cancels recurring charges by setting `pay_upfront = false`. The subscription remains active until `service_end_ts`. Requires `subscriber` authorization.

**Errors:** `SubscriptionNotFound`, `Unauthorized`, `AlreadyCancelled`

**Events:** `cancel` — includes remaining active seconds.

### 6.3 Toggle Pay Upfront

#### `toggle_pay_upfront(subscriber, sub_id) -> bool`

Toggles `pay_upfront` on or off. When turning on, refreshes the token approval for `approve_periods` periods. Cannot re-enable on an expired subscription. Requires `subscriber` authorization.

**Returns:** new `pay_upfront` value.

**Errors:** `SubscriptionNotFound`, `Unauthorized`, `SubscriptionExpired`

**Events:** `renew`, `approve` (when re-enabling)

### 6.4 Extend Subscription

#### `extend_subscription(subscriber, sub_id) -> Subscription`

Refreshes the token approval and sets `pay_upfront = true`. Use this when your allowance is running low and you want the subscription to continue renewing. Can also convert a one-time subscription to recurring. Requires `subscriber` authorization. Subscription must not be expired.

**Errors:** `SubscriptionNotFound`, `Unauthorized`, `SubscriptionExpired`, `ServiceNotFound`

**Events:** `extend`, `approve`

### 6.5 Process (Batch Charge)

#### `process(merchant, service_id) -> ProcessResult`

Merchant-initiated batch charge. Iterates all subscriptions for the given service and charges those that are due (`pay_upfront = true` and `now >= next_charge_ts`). Uses `transfer_from` with the pre-approved allowance. Requires `merchant` authorization.

For each subscription:
- **Success:** advances `next_charge_ts` and `service_end_ts` by `period_secs` (no drift — based on previous `next_charge_ts`, not current time).
- **Failure:** sets `pay_upfront = false` (auto-cancels).

**Errors:** `ServiceNotFound`, `NotServiceOwner`, `TimestampOverflow`

**Events per subscription:**
- `charge` — successful payment
- `trl_end` — first charge after trial ended
- `low_alw` — remaining allowance < price
- `low_bal` — subscriber balance < price
- `chg_fail` — payment failed, subscription auto-cancelled

Next: [`7-Query-Methods`](7-query-methods.md)
