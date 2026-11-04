## 10. Security Considerations

### 10.1 Who can spend the allowance

Only this contract's own code, and only through `process`.

- `transfer_from` appears in one place: the charge path of `process`.
- `process` runs only when signed by the service's `merchant` or its executor.
- `transfer_from` needs the spender's authorization. The spender is this contract. The contract has no `__check_auth`, and a contract authorizes only calls its own code makes.
- So neither the merchant's key, nor the executor's key, nor the subscriber's key, nor any combination of them, can call `transfer_from` on the allowance directly. They can only ask the contract to apply the charge rule.
- Every charge goes to `service.merchant`, which is fixed at `register_service`. No caller can choose the recipient or the amount.

Review checklist for the implementation:

- `transfer_from` is called only in the charge path;
- the token address is set once, in the constructor, and never changes;
- the contract calls no contract other than the token.

### 10.2 What the token enforces and what the contract enforces

| Rule | Enforced by |
|---|---|
| A charge never exceeds the allowance or the subscriber's balance | Pi token (protocol) |
| Only the subscriber can change the allowance | Pi token (protocol) |
| The allowance is deleted at its expiry ledger | Network (temporary storage) |
| A charge never exceeds the subscription's `reserved` | Contract |
| At most one charge per period, only inside the window `[period_end_ts, period_end_ts + period_secs)` | Contract |
| Charges only on subscriptions that have an item in their deadline's day bucket, of a non-`Inactive` service, paid to `service.merchant` | Contract |
| The approval set at each signed call is never lower than what live subscriptions can charge | Contract (`Allowance.total`) |
| One live subscription per (subscriber, service); one trial per (subscriber, service) | Contract |
| Sign-ups only on `Open` services | Contract |
| Only the merchant or its executor can call `process` | Contract |

The contract rules hold for every caller, including direct RPC calls that bypass any app or wallet.

### 10.3 What the subscriber signs

The subscriber's signature on `subscribe`, `extend`, `cancel` or `refresh_approval` covers the whole call tree, including the inner token `approve` with its exact amount and expiry, and the first-payment `transfer` at `subscribe`. Wallets should show these values to the user, read from the transaction itself.

The approve expiry is rounded up to a 720-ledger bucket (and, when capped, the cap is rounded down to one) so that it is almost always the same at simulation and at execution; see [10.10](#1010-known-limitation-approve-expiry-mismatch) for the exception. If a charge lands between simulation and execution, `total` changes, the signature no longer matches, and the call fails without effect. The wallet simulates again and asks for a new signature.

`extend` carries `expected_period_end` for the same reason: if a charge moved `period_end_ts` after the subscriber read it, the call fails with `PeriodMismatch`.

### 10.4 Storage expiry

Every Soroban entry has a time to live (TTL). Pi Testnet settings (checked 2026-11-02):

| Setting | Ledgers | About |
|---|---|---|
| `min_persistent_ttl` | 120,960 | 7 days |
| `max_entry_ttl` | 3,110,400 | 180 days |
| `min_temporary_ttl` | 720 | 1 hour |

How the contract manages it:

- Each entry has a target, converted at 5 seconds per ledger and capped at the network maximum (table below).
- An entry is extended to its target only when its remaining TTL is below `target - min(1 day, target / 2)`. So repeated calls in the same period do not each pay for a tiny bump, and the contract never extends to the maximum on every write, which keeps fees low.
| Entry | Target: kept live until | Extended by |
|---|---|---|
| `Sub`, `Service` | the subscription's window end plus 7 days: `period_end_ts + period_secs + 7 days` | `subscribe`, `extend`, `cancel`, a successful charge |
| `Bkt(subscriber, day)` and its overflow parts `BktPart(subscriber, day, k)` | the end of that UTC day plus 7 days (the same rule for every part) | every write to that part |
| `Allowance(subscriber)` | `max(max_close, end of the last busy day) + 7 days`, so the record outlives its buckets even after `total` reached 0 | every store, including when the record was unchanged and not rewritten |
| `Executor(service_id)` | as the `Service` | a successful charge made by the executor |
| `WalletSubs`, `WalletSubCount` | minimum TTL | never; the `subscribe` that appends restores an archived page or count |
- `register_service` does not extend the new `Service`; it starts at the network minimum.
- `ActiveSub` and `TrialUsed` are written once at the network minimum and never extended.
- Ended subscriptions are allowed to archive. Cleanup restores an archived past bucket part when it releases it; each counts as a disk read and toward the transaction's read and write byte limits. The cleanup item budget (2,000 items per call) keeps that within Pi's limits even when every past part is full and archived ([6.6](6-subscription-lifecycle.md#66-cleanup)).

| Entry | Storage | When it expires | Recoverable? |
|---|---|---|---|
| Token allowance | temporary | At its expiration ledger: at most about 180 days after the last approve | **No.** It is deleted. Only the subscriber can set a new one, with any signed call (`refresh_approval` is the simplest). If it lapses while a subscription is still live, that subscription's charges return `ApprovalLost` (nothing changes, retried) until the subscriber's next signed call re-approves `total`. |
| `Sub`, `Service`, `Allowance`, current `Bkt` and `BktPart` parts | persistent | Kept live by charges and writes | Yes |
| `WalletSubs` pages, `WalletSubCount` | persistent | Archive after the minimum TTL | Yes: still readable; restored by the next `subscribe` |
| An ended subscription's entries, `ActiveSub`, `TrialUsed` | persistent | Archive after their TTL | Yes |
| Contract instance and code | instance / code | If nobody extends them | Yes |

On Pi, an archived persistent entry is not lost. It is still returned by reads and simulations, and the next transaction that touches it restores it automatically (the restore is paid by that transaction). So the guards still hold: a `subscribe` that needs an archived `ActiveSub` or `TrialUsed` restores it and checks it. Clients should treat "needs restore" as a normal case, not an error. Each archived entry a transaction touches counts as a disk read.

Because an allowance lives at most about 180 days, a long plan needs the subscriber to sign again before then. Any signed call renews the expiry. The contract does not store the expiry; off-chain readers read it from the token's allowance entry (`["Allowance", {from, spender}]` → `{amount, live_until_ledger}`) and can prompt the subscriber before it lapses.

### 10.5 Direct edits to the allowance

A subscriber can call the token's `approve` directly, outside this contract.

| Edit | Effect |
|---|---|
| Revoke (set to 0) | Each charge returns `ApprovalLost`. Nothing changes; the charges are retried until their windows close, then become `Stale`. The next signed call re-approves `total`. |
| Lower, but not to 0 | Charges that need more than is left fail with `ChargeFailed`. The subscriptions stay `Due` and are retried until their windows close, then become `Stale`. |
| Raise | No effect on what can be charged: each subscription still takes at most its `reserved`, one price per period |

The next call the subscriber signs on this contract sets the allowance back to `total`.

Between signatures, and while a cleanup backlog remains (`more = true`), the allowance can be higher than the live budgets need (see [6.7](6-subscription-lifecycle.md#67-keeping-the-allowance-in-sync)). It is never lower. That extra amount cannot be spent, because every charge must pass the charge rule against the subscription's own `reserved` budget.

### 10.6 Executor key leak

An executor key can only call `process` for its service. If it leaks, an attacker can:

- charge subscriptions that are already due, exactly as the merchant would: one price per period, inside the window, to the merchant;
- spend the executor account's own balance on fees.

It cannot raise amounts, charge early, charge twice for a period, change the service, set another executor, or send funds anywhere but the merchant. The merchant removes or replaces it with `set_executor`.

The merchant key is more powerful: it can change service state and set the executor. Keep it offline and use an executor key for billing servers.

### 10.7 Subscriber protections

- `cancel` needs only the subscriber's signature. A subscriber can always stop future charges.
- Service terms never change after sign-up. A merchant cannot raise the price on existing subscribers.
- Total charges never exceed the budget the subscriber approved (`price × periods`, plus any `extend`).
- A subscriber can also revoke the allowance in the token directly at any time. A revoked or expired allowance stops all charges for that subscriber (`ApprovalLost`) until the subscriber signs any call on this contract, which re-approves `total`. `cancel` stops a subscription for good.

### 10.8 Upgrades

The admin can replace the contract code. New code could change any rule above. To make that visible:

- every upgrade is proposed first and can be applied only after a 7-day timelock ([8.2](8-admin-methods.md#82-upgrades-7-day-timelock));
- the pending upgrade, with its WASM hash, can be read by anyone with `get_pending_upgrade`;
- during those 7 days, subscribers can `cancel` or revoke their allowance, and merchants can stop billing.

The admin role itself moves only through a two-step handover.

### 10.9 Limits

- No limit on live subscriptions per wallet. A signed call with nothing to clean touches 7–16 ledger entries (`subscribe`: 15–16, including the token's entries and the wallet index), whatever the number of live subscriptions. This was measured on the reference implementation from 1 to 2,000 live subscriptions.
- Cleanup releases at most 40 bucket parts per signed call, and starts no new part after 2,000 items (at most about 2,063 items, about 92 KB). With a 40-page backlog that adds about 40 reads and 40 writes. The rest waits for the next signed call.
- `process` ×15 worst case is 108,896 write bytes (two full 64-item parts rewritten per charge), under the 132,096 limit ([6.5](6-subscription-lifecycle.md#65-process-batch-charge)). Billing clients should still split a batch whose simulation exceeds the limit.
- A day bucket never fills up. Each part holds at most 64 items (about 2.9 KB). Removals leave holes that later inserts reuse; a new overflow part is created only when every existing part of that day is full. A normal day (at most 64 items) costs 1 read + 1 write to insert, find or remove. A day with `k` parts costs up to `k` reads to find, plus one probe of the missing next key when every part is full or the item is not there.
- At most 15 items per `process` call (`ProcessLimitTooHigh`), sized for Pi Testnet's per-transaction limits.
- `get_subscriptions` reads at most 50 ids per call (`TooManyIds`).

### 10.10 Known limitation: approve expiry mismatch

The approve expiry is rounded up to a 720-ledger bucket so that it is normally the same at simulation and at execution. If the ledger at execution has crossed a bucket edge since simulation, the executed `approve` expiry differs from the simulated one. The subscriber's signed authorization then no longer matches, and the transaction fails with an auth error. This is estimated at 0.1–0.4% of signed calls.

Nothing changes on-chain when this happens. Clients should treat this auth error as "simulate again and sign again", and retry automatically.

### 10.11 Known limitation: UTC midnight between simulation and execution

Cleanup releases whole past UTC days only, so simulation and execution normally see the same days and produce the same `CleanupReport` and approve amount. If a UTC midnight passes between simulation and execution, execution sees one more past day. The cleanup result, and so the approve amount, can differ from what the subscriber signed, and the transaction fails with an auth error. Nothing changes on-chain. This is rare. Clients handle it as in 10.10: simulate again, sign again, resubmit.

### 10.12 Known behaviour: over-approval windows

The token allowance set at a signed call can be higher than what the wallet's subscriptions can still be charged. This is expected; that extra amount cannot be spent ([6.7](6-subscription-lifecycle.md#67-keeping-the-allowance-in-sync)).

| Case | How long the extra amount stays | Why |
|---|---|---|
| A subscription of a service made `Inactive` | Up to one billing period after its `period_end_ts`, until its deadline's day has passed and the subscriber signs again | `process` changes nothing for it (`Ended`), so its item stays in the bucket of its deadline (`period_end_ts + period_secs`). Cleanup releases it only after that day. |
| A subscription that ends today (window closed, or budget used up) | Until the next UTC midnight, then until the subscriber's next signed call | Cleanup releases whole past days only; today's bucket waits. |
| Any ended subscription while a cleanup backlog remains (`more = true`) | Until enough signed calls have cleaned the backlog | Each call releases at most 40 parts. |

In every case, charges still need a live subscription in its window with `reserved >= price`, so the extra amount is unspendable.

### 10.13 Known behaviour: very many far-future days

A bucket day 512 or more days after `clean_through` is not tracked in the bitmap. It is listed in `Allowance.far_days` instead, one entry per such day. Normal plans never need it; it takes periods or trials of more than about 512 days.

A wallet that creates thousands of subscriptions whose windows close on different far-future days grows `far_days` toward Soroban's 64 KB entry limit.

- The `Allowance` record is read and rewritten by that wallet's signed calls and charges, so each of them gets more expensive as it grows. They can fail on per-transaction byte limits.
- Adding a far day fails once the record would exceed the entry limit.
- Only the wallet that creates the subscriptions is affected, so the problem is self-inflicted.

A mitigation is under discussion.

### 10.14 Possible later upgrades

- A public, permissionless `cleanup(subscriber)`. Anyone, for example a backend, could release an idle wallet's past day buckets and pay the fee. It would lower `Allowance.total` but could not change the token allowance (that needs the subscriber's signature). It is not in this revision.

Back to: [`ReadMe`](ReadMe.md)
