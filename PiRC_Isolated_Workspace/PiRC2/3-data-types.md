## 3. Data Types

### 3.1 Service

| Field | Type | Description |
|---|---|---|
| `service_id` | `u64` | Auto-incremented unique identifier |
| `merchant` | `Address` | Service owner's address |
| `name` | `String` | Display name of the service |
| `price` | `i128` | Amount charged per period |
| `period_secs` | `u64` | Billing cycle duration in seconds |
| `trial_period_secs` | `u64` | Free trial duration in seconds (0 = no trial) |
| `approve_periods` | `u64` | Number of periods to pre-approve when `pay_upfront = true` |
| `is_active` | `bool` | Whether the service accepts new subscriptions |
| `created_at` | `u64` | Ledger timestamp at creation |

### 3.2 Subscription

| Field | Type | Description |
|---|---|---|
| `sub_id` | `u64` | Auto-incremented unique identifier |
| `subscriber` | `Address` | Subscriber's address |
| `service_id` | `u64` | Associated service ID |
| `price` | `i128` | Price locked at subscription time |
| `period_secs` | `u64` | Billing cycle duration (copied from service) |
| `trial_period_secs` | `u64` | Trial duration (copied from service) |
| `trial_end_ts` | `u64` | Timestamp when trial ends (0 if no trial) |
| `pay_upfront` | `bool` | If `true`, `process()` will charge this subscription on each cycle |
| `service_end_ts` | `u64` | Timestamp when current active period expires |
| `next_charge_ts` | `u64` | Next time `process()` will attempt to charge |
| `created_at` | `u64` | Ledger timestamp at creation |

### 3.3 ProcessResult

| Field | Type | Description |
|---|---|---|
| `charged` | `u32` | Subscriptions successfully charged |
| `failed` | `u32` | Subscriptions where payment failed (auto-cancelled) |
| `skipped` | `u32` | Subscriptions not yet due or not `pay_upfront` |

Next: [`4-Error-Codes`](4-error-codes.md)
