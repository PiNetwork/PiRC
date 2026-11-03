## 6. Subscription Lifecycle

Every subscriber method (`subscribe`, `extend`, `cancel`, `refresh_approval`) requires `subscriber` authorization, runs `sync_pool` ([6.6](#66-keeping-the-allowance-in-sync)) to drop ended ids, and ends by **setting** the token allowance to the subscriber's live sum. The subscriber's signature covers that inner `approve` call, its amount and its expiry.

### 6.1 Subscribe

#### `subscribe(subscriber: Address, service_id: u64, periods: u64, claim_trial: bool) -> u64`

Creates a subscription and returns its `sub_id`.

| Param | Type | Description |
|---|---|---|
| `subscriber` | `Address` | The paying wallet |
| `service_id` | `u64` | Service to subscribe to |
| `periods` | `u64` | Number of future periods to budget for. May be 0. |
| `claim_trial` | `bool` | Ask for the free trial. Ignored if the service has no trial. |

Steps, in order:

1. The service must exist (`ServiceNotFound`) and be `Open` (`ServiceNotOpen`).
2. If `ActiveSub(subscriber, service_id)` points to a subscription that has not ended: `AlreadySubscribed`. A cancelled subscription that is still inside its paid period counts as not ended.
3. `sync_pool`: drop ended ids. The Pool must then hold fewer than 50 ids (`PoolFull`).
4. `reserved = price × periods` (`AmountOverflow`).
5. Trial or first payment (below). `period_end_ts` is computed with `TimestampOverflow` checks.
6. Save the subscription. Set `ActiveSub(subscriber, service_id) = sub_id`. Add the `sub_id` to the Pool.
7. Set the allowance to the live sum.

**Trial or first payment.** A trial is granted when `claim_trial` is true, `trial_period_secs > 0` and `TrialUsed(subscriber, service_id)` is not set. `TrialUsed` is read only when the first two are true.

| Case | Money moved now | `period_end_ts` | `paid_periods` | Other |
|---|---|---|---|---|
| Trial | none | `now + trial_period_secs` | 0 | sets `TrialUsed` |
| No trial | `token.transfer(subscriber → merchant, price)` | `now + period_secs` | 1 | — |

The first payment is a plain transfer the subscriber signs. It does not come from the allowance or from `reserved`.

**What the subscriber approves.** The subscriber signs one transaction that contains:

- the first payment, if there is no trial: exactly `price`, to the service's `merchant`;
- one `approve` of the contract as spender, for the live sum (this subscription's `price × periods` plus the remaining budgets of the subscriber's other subscriptions still in the Pool), expiring after the live horizon. If the allowance had expired or been revoked, this also re-approves the subscriber's other live subscriptions.

Examples for a service at 5 Pi per 30 days:

| `periods` | `claim_trial` (service has a 7-day trial, unused) | Paid now | `reserved` | Charges that can follow |
|---|---|---|---|---|
| 12 | `true` | 0 | 60 Pi | 12, the first at the end of the trial |
| 12 | `false` | 5 Pi | 60 Pi | 12, the first after 30 days |
| 0 | `false` | 5 Pi | 0 | none: one paid period, then it ends |
| 0 | `true` | 0 | 0 | none: trial only, then it ends |

**Errors:** `ServiceNotFound`, `ServiceNotOpen`, `AlreadySubscribed`, `PoolFull`, `AmountOverflow`, `TimestampOverflow`. The call also fails if the token refuses the first payment (for example, low balance).

**Events:** `sub_new` (`amount` = first payment, 0 for a trial), `approval`

### 6.2 Extend

#### `extend(subscriber: Address, sub_id: u64, periods: u64, expected_period_end: u64)`

Adds `price × periods` to the subscription's budget. Moves no money.

| Param | Type | Description |
|---|---|---|
| `subscriber` | `Address` | Must be the subscription's subscriber |
| `sub_id` | `u64` | Subscription to extend |
| `periods` | `u64` | Periods to add. May be 0: that only re-approves (and re-adds a cancelled subscription to the Pool). |
| `expected_period_end` | `u64` | The `period_end_ts` the subscriber saw. Guards against a charge landing between reading and signing. |

Steps, in order:

1. The subscription must exist (`SubscriptionNotFound`), belong to `subscriber` (`Unauthorized`), and its service must exist (`ServiceNotFound`).
2. `period_end_ts` must equal `expected_period_end` (`PeriodMismatch`).
3. The subscription must not have ended: the window is still open, the service is not `Inactive`, and it is not past `period_end_ts` with `reserved < price`. Otherwise `SubscriptionEnded`.
4. `sync_pool`: drop ended ids. If this subscription is not in the Pool, the Pool must hold fewer than 50 ids (`PoolFull`).
5. `reserved += price × periods` (`AmountOverflow`).
6. Put the id back in the Pool if it is not there. Only a cancelled subscription still inside its period can be missing: every other live subscription is already in the Pool.
7. Set the allowance to the live sum. This also renews the allowance's expiry for all live subscriptions.

An ended subscription never comes back. To continue after it ends, the subscriber calls `subscribe` again. `extend` does not read `ActiveSub`: a subscription replaced by a newer one has always ended first, because `subscribe` requires that. A cancelled subscription that is still inside its paid period has not ended, so `extend` before `period_end_ts` undoes the cancel.

**Errors:** `SubscriptionNotFound`, `Unauthorized`, `ServiceNotFound`, `PeriodMismatch`, `SubscriptionEnded`, `PoolFull`, `AmountOverflow`

**Events:** `sub_ext` (`amount` = budget added), `approval`

### 6.3 Cancel

#### `cancel(subscriber: Address, sub_id: u64)`

Stops all future charges. Needs only the subscriber's signature, so a subscriber can always stop paying.

Steps, in order:

1. The subscription must exist (`SubscriptionNotFound`), belong to `subscriber` (`Unauthorized`), and its service must exist (`ServiceNotFound`).
2. `sync_pool`: drop ended ids.
3. If `reserved > 0` and the subscription has not ended: set `reserved = 0`, save it, and emit `sub_cncl`.
4. Remove this subscription from the Pool.
5. Set the allowance to the remaining live sum, or revoke it (`approve(…, 0, 0)`) if nothing is left.

`period_end_ts` does not change, so access lasts to the end of the current paid or trial period. Status stays `Trial` or `Paid` until then, then becomes `Ended`.

`cancel` is idempotent. Cancelling an already cancelled or ended subscription writes nothing and emits no `sub_cncl`. Only the sync and the re-approve run.

**Errors:** `SubscriptionNotFound`, `Unauthorized`, `ServiceNotFound`

**Events:** `sub_cncl` (`amount` = budget released; only when step 3 runs), `approval`

### 6.4 Refresh approval

#### `refresh_approval(subscriber: Address)`

Runs `sync_pool` (drop ended ids) and sets the allowance to the live sum with a new expiry. It does not change any subscription record.

Use it to:

- renew an allowance that will expire soon (Pi caps an allowance's life at about 180 days, see [10.4](10-security-considerations.md#104-storage-expiry));
- clear a leftover allowance after subscriptions ended ([6.6](#66-keeping-the-allowance-in-sync));
- restore billing after the allowance expired or was revoked, or after the subscriber lowered it directly in the token. Live subscriptions stay in the Pool in every case, so this one call re-approves all of them.

**Events:** `approval`

### 6.5 Process (batch charge)

#### `process(caller: Address, service_id: u64, items: Vec<ChargeItem>) -> Vec<ItemResult>`

Charges due subscriptions of one service. Returns one `ItemResult` per item, in order.

**Call-level checks**, in this order (the whole call fails):

| # | Check | Error |
|---|---|---|
| 1 | At most 15 items | `ProcessLimitTooHigh` |
| 2 | `caller` authorization | host auth error |
| 3 | The service exists | `ServiceNotFound` |
| 4 | `caller` is the service's `merchant` or its `Executor(service_id)` | `NotProcessExecutor` |

**Charge rule, per item.** Checks run in order; the first that fails decides the outcome.

| # | Check | If it fails | Pool | `sub_end` reason |
|---|---|---|---|---|
| 1 | The `sub_id` exists | `Ended` | — | — |
| 2 | `sub.service_id == service_id` and `period_end_ts == expected_period_end` | `AlreadyHandled`, nothing changes | unchanged | — |
| 3 | `now >= period_end_ts` | `NotDue` | unchanged | — |
| 4 | `now < period_end_ts + period_secs` | `Stale` | id dropped | `Stale` |
| 5 | `reserved >= price` | `Exhausted` | id dropped | `Exhausted` |
| 6 | Service is not `Inactive` | `Ended` | id dropped | `ServiceInactive` |
| 7 | The id is in `Pool(subscriber)` | `Ended` | — | — |
| 8 | The token allowance is not 0 | `ApprovalLost`, nothing changes | unchanged | — |
| 9 | `try_transfer_from(contract, subscriber → merchant, price)` succeeds | `ChargeFailed`, nothing changes | unchanged | — |
| ✓ | — | `Charged` | unchanged | — |

**On `Charged`:** `period_end_ts += period_secs`, `reserved -= price`, `paid_periods += 1`. The token lowers the allowance by `price` itself. Event `charged`. Then `low_bal` if the subscriber's balance is now below `price`, and `low_alw` if the allowance is now below `price`.

The allowance in step 8 is read from the token once per subscriber per call, then lowered by `price` after each charge in the same call.

**On `ApprovalLost`:** nothing is written and the id stays in the Pool. The allowance has expired or been revoked. The subscription stays `Due` and later `process` runs can retry it until its window closes. Any call the subscriber signs (for example `refresh_approval`) re-approves the live sum, after which a retry can succeed.

**On `ChargeFailed`:** nothing is written. The allowance is non-zero, but the transfer failed: the balance is too low, or the subscriber lowered the allowance below the price. The subscription stays `Due` and later `process` runs can retry it until its window closes. After that it is `Stale` and dropped. The subscriber can fix the cause (top up the wallet, or call `refresh_approval` or `extend`) before then.

**On a drop:** the id is removed from that subscriber's Pool, and the Pool is rewritten (or removed if it is now empty). The subscription record is not rewritten. Only ended subscriptions are dropped, and the charge rule can never use them again. Step 7 (Pool membership) is a backstop: every live subscription with budget is in its Pool. `sub_end` is emitted only when the id was actually in the Pool, so a retried item does not emit it twice.

**Idempotency.** `expected_period_end` is the key. After a charge, `period_end_ts` has moved, so the same item sent again returns `AlreadyHandled` and charges nothing. A retried or duplicated batch is a no-op. The window rule is what makes paying twice for one period impossible; `expected_period_end` makes retries safe.

**No partial failure.** One bad item never fails the batch. A failed transaction still costs fees on Soroban, so outcomes are reported per item and the call succeeds overall.

**Batch cap.** 15 items per call. The cap keeps the worst case under Pi Testnet's per-transaction limits:

| Limit | Value |
|---|---|
| Event bytes | 16,384 |
| Write entries | 200 |
| Write bytes | 132,096 |
| Disk reads | 200 |
| Footprint entries | 400 |
| Instructions | 400M |

**Who calls it.** The contract does not schedule charges. The merchant's server (or any process holding the merchant or executor key) keeps its own list of subscriptions, reads their `period_end_ts`, and sends the due ones. A charge can land any time inside its window, so a late run still collects the period without shifting the next one.

### 6.6 Keeping the allowance in sync

The Pi token keeps one allowance per (subscriber, contract). Only the subscriber's signature can change it. So the contract cannot shrink it on its own. Instead, it keeps exact per-subscription budgets and resets the token's number whenever the subscriber signs.

**When a subscription has ended.**

```
ended = now >= period_end_ts
        && (reserved < price || now >= period_end_ts + period_secs || service.state == Inactive)
```

Once a subscription has ended, it stays ended: no call can raise its `reserved` or move its `period_end_ts`.

**Approval invariant.** Between calls, the sum of live budgets (whole prices) is at most the token allowance. Every signed call sets the allowance to the live sum, and every charge lowers both by one price. The invariant breaks only if the allowance expired (no signed call for its whole lifetime) or the subscriber edited it directly in the token.

**Expired or revoked allowance.** This needs no special case in the contract.

- An approval normally lapses only after its horizon plus margin, by which time every subscription it covered has ended. The usual "drop ended ids" step clears them.
- A subscription can still be live when the allowance is 0: when its budget reaches past the network's approve cap (about 180 days), or after the subscriber revoked the allowance directly. It stays in the Pool. Its charges return `ApprovalLost` (nothing changes, retried), and the subscriber's next signed call re-approves it with the rest of the live sum.
- A lowered but non-zero allowance is handled the same way. Charges it cannot cover fail as `ChargeFailed` and are retried, and the next signed call sets the allowance back to the live sum.

**`sync_pool(subscriber)`**, run first by `subscribe`, `extend`, `cancel` and `refresh_approval`:

1. Load each listed subscription and its service.
2. Drop ended ids, and ids whose subscription or service is missing. Their records are not rewritten, and no event is emitted. Live ids are kept.

`sync_pool` does not read the token allowance. If the call later fails, the drop rolls back with it.

The call then applies its own change: `subscribe` and `extend` add their id, `cancel` removes its id. Then the contract totals the ids left:

- `live_sum = Σ (reserved / price) × price` (whole prices only; `AmountOverflow` if it overflows);
- `horizon = max(period_end_ts + (reserved / price) × period_secs)`: the time the last live budget would run out.

**Approve**, the last step of every subscriber-signed call:

```
token.approve(subscriber, contract, live_sum, expiration_ledger)
```

| Part | Rule |
|---|---|
| Amount | `live_sum`. Always a **set**, never an add. |
| Target time | `horizon + max(largest period_secs among the live subscriptions, 7 days)` |
| To a ledger | `current_ledger + ceil((target time - now) / 5)` |
| Rounding | Rounded **up** to a multiple of 720 ledgers (about 1 hour), so simulation and execution produce the same value and the subscriber's signature still matches |
| Cap | At most `current_ledger + max_ttl - 1`, where `max_ttl` is the network's maximum entry TTL as reported to contracts. The cap is rounded **down** to a multiple of 720 ledgers, so a capped value also stays the same between simulation and execution. |
| Nothing live | `live_sum == 0` → `approve(subscriber, contract, 0, 0)`: revoke |

The Pool is saved only if `live` changed. The expiry the contract set is not stored in the contract. It lives in the token's own allowance entry (`["Allowance", {from, spender}]` → `{amount, live_until_ledger}`), which off-chain readers fetch directly.

Rounding keeps the expiry the same between simulation and execution in almost every case, but not at a bucket edge. See [10.10](10-security-considerations.md#1010-known-limitation-approve-expiry-mismatch).

**What changes the allowance.**

| Trigger | Signed by | Contract records | Token allowance |
|---|---|---|---|
| `subscribe`, `extend`, `cancel`, `refresh_approval` | subscriber | `sync_pool`, then the change | set to the live sum, expiring after the live horizon |
| A charge succeeds | merchant or executor | `reserved -= price`, `paid_periods += 1`, `period_end_ts += period_secs` | the token lowers it by `price` |
| A charge finds the subscription stale, exhausted or its service inactive | merchant or executor | id dropped from the Pool | unchanged |
| A charge finds the allowance at 0 (`ApprovalLost`) | merchant or executor | nothing | unchanged (0) |
| A charge fails with a non-zero allowance (`ChargeFailed`) | merchant or executor | nothing | unchanged |
| A subscription ends with no call at all | — | nothing | unchanged |

**Why a leftover can exist.** A subscription can end without the subscriber signing anything: its window passes, its budget runs out, or the service becomes `Inactive`. The contract cannot lower the token allowance then. So, until the subscriber's next signed call, the allowance can be larger than the live budgets need.

**Why the leftover cannot be spent.**

- `transfer_from` is called only by `process`, only for an item that passes the charge rule.
- The charge rule takes at most one `price` per period, only from a subscription in its window with `reserved >= price`, and lowers `reserved` by the same amount.
- So total charges can never exceed the sum of live `reserved` budgets, whatever the allowance says.

The leftover is removed at the subscriber's next signed call (any of the four methods). In any case it expires with the allowance at the expiry set by the last approve, not at the network maximum. `get_pool` returns the current `live_sum`, so a wallet can compare it with the token's allowance and offer `refresh_approval` to clean up.

**Direct edits.** A subscriber can call the token's `approve` directly, outside this contract.

| Edit | Effect |
|---|---|
| Revoke (set to 0) | Charges return `ApprovalLost` and are retried; nothing changes. The next signed call re-approves the live sum. |
| Lower, but not to 0 | Charges it cannot cover fail with `ChargeFailed` and are retried. The next signed call sets the allowance back to the live sum. |
| Raise | No effect on what can be charged: each subscription still takes at most its `reserved`, one price per period. The next signed call sets it back to the live sum. |

### 6.7 Status

Status is derived when read, never stored ([3.3](3-data-types.md#33-views)).

| Status | Condition | Active |
|---|---|---|
| `Trial` | `now < period_end_ts` and `paid_periods == 0` | yes |
| `Paid` | `now < period_end_ts` and `paid_periods > 0` | yes |
| `Due` | `period_end_ts <= now < period_end_ts + period_secs` and `reserved >= price` and service not `Inactive` | yes |
| `Ended` | otherwise | no |

`status` uses only the stored fields, the service and the clock. It does not show whether the allowance covers the next charge. A `Due` subscription whose allowance expired or was revoked still reads `Due` ([3.3](3-data-types.md#33-views)).

Typical paths:

| Path | Status over time |
|---|---|
| Trial, then renews | `Trial` → `Due` → `Paid` → `Due` → `Paid` … |
| Paid, budget runs out | `Paid` → `Due` … `Paid` → `Ended` (at `period_end_ts` once `reserved < price`) |
| Cancel | `Paid` → `Paid` (to `period_end_ts`) → `Ended` |
| Charge fails, then the subscriber tops up | `Due` (`ChargeFailed`, retried) → `Paid` |
| Allowance expired or revoked, subscriber signs in time | `Due` (`ApprovalLost`, retried) → `refresh_approval` → `Paid` |
| Allowance expired or revoked, subscriber does nothing | `Due` (`ApprovalLost`, retried) → `Ended` (when the window closes) |
| Charge keeps failing, or nobody bills it | `Paid` → `Due` → `Ended` (when the window closes) |
| Service made `Inactive` | `Paid` → `Ended` (at `period_end_ts`) |

`Ended` is final.

Next: [`7-Query-Methods`](7-query-methods.md)
