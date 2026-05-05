## 5. Constructor and Service Management

### 5.1 Constructor

#### `__constructor(admin, token)`

Initializes the contract.

| Param | Type | Description |
|---|---|---|
| `admin` | `Address` | Contract administrator (can upgrade) |
| `token` | `Address` | Payment token contract address |

### 5.2 Service Management

#### `register_service(merchant, name, price, period_secs, trial_period_secs, approve_periods) -> Service`

Creates a new service. Requires `merchant` authorization.

| Param | Type | Description |
|---|---|---|
| `merchant` | `Address` | Service owner |
| `name` | `String` | Service name (non-empty) |
| `price` | `i128` | Price per period (> 0) |
| `period_secs` | `u64` | Billing cycle in seconds (> 0) |
| `trial_period_secs` | `u64` | Trial duration in seconds (0 = no trial) |
| `approve_periods` | `u64` | Number of periods to pre-approve for recurring subscribers (> 0) |

**Errors:** `InvalidPrice`, `InvalidPeriod`, `InvalidServiceName`

**Events:** `srv_reg` — service registered.

Next: [`6-Subscription-Lifecycle`](6-subscription-lifecycle.md)
