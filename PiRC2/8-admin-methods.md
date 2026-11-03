## 8. Admin Methods

The admin can hand over the admin role and upgrade the contract code. No admin method reads or changes services, subscriptions, allowances or funds. New code could, which is why every upgrade waits 7 days in public before it applies.

### 8.1 Admin handover (two steps)

#### `propose_admin(new_admin: Address)`

Requires the current admin's authorization. Records `new_admin` as `PendingAdmin`, overwriting any earlier proposal. The current admin stays in charge until the handover is accepted.

#### `accept_admin(new_admin: Address)`

Checks that a proposal exists (`NoAdminProposed`) and that `new_admin` equals `PendingAdmin` (`NotProposedAdmin`), then requires `new_admin`'s authorization. Makes `new_admin` the admin and clears `PendingAdmin`.

Two steps mean the role can never move to a mistyped or unowned address.

**Errors:** `NoAdminProposed`, `NotProposedAdmin`

**Events:** `admin`, topic `[admin]`, data `(phase, new_admin)` with phase `propose` or `accept`.

### 8.2 Upgrades (7-day timelock)

An upgrade replaces the contract's WASM code. Stored data stays. It takes two calls at least 7 days apart, so users and merchants can see a proposed upgrade and react (for example, cancel subscriptions) before it applies.

| Method | Auth | Does | Errors |
|---|---|---|---|
| `propose_upgrade(wasm_hash: BytesN<32>) -> PendingUpgrade` | admin | Stores and returns `{wasm_hash, apply_after_ts = now + 7 days}` | `UpgradeAlreadyPending`, `TimestampOverflow` |
| `apply_upgrade()` | admin | Clears the pending upgrade and replaces the code with its `wasm_hash` | `NoUpgradeProposed`, `UpgradeTimelockNotElapsed` |
| `cancel_upgrade()` | admin | Clears the pending upgrade | `NoUpgradeProposed` |
| `get_pending_upgrade() -> Option<PendingUpgrade>` | — | Returns the pending upgrade, if any | — |

**Events:** `upgrade`, topic `[upgrade]`, data `(phase, wasm_hash)` with phase `propose`, `apply` or `cancel`.

Rules every upgrade follows, so stored data never breaks:

- Records are versioned enums. A new field means a new variant; new code reads every older variant ([3.1](3-data-types.md#31-versioned-records)).
- Methods are added, never changed or removed in place.
- Enum variants and error codes are append-only.
- New event fields are added as new keys.
- Never upgrade to code that cannot read records already written.

### 8.3 `version() -> u32`

Returns the contract version. This contract starts at `1`.

### 8.4 Storage lifetime of the instance

The contract instance (admin, token, counters, pending admin and upgrade) and the contract code are extended to the network maximum by the constructor and by the admin calls `propose_admin`, `accept_admin`, `propose_upgrade`, `apply_upgrade` and `cancel_upgrade`. Subscriber and billing calls do not extend them. Like any Soroban entry, anyone can also extend their life with a standard TTL-extension transaction.

Next: [`9-Subscription-Setup-Guide`](9-subscription-setup-guide.md)
