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
| Every charge is exactly `price`, from a subscription of a non-`Inactive` service, paid to `service.merchant` | Contract |
| One live subscription per (subscriber, service); one trial per (subscriber, service) | Contract |
| Sign-ups only on `Open` services | Contract |
| Only the merchant or its executor can call `process` | Contract |

The contract rules hold for every caller, including direct RPC calls that bypass any app or wallet.

The allowance is **not** what keeps one subscription from using another's share. It is one shared number per wallet. The per-subscription guards (the rows marked "Contract" above) bound each subscription ([6.7](6-subscription-lifecycle.md#67-per-subscription-guards-and-accepted-limitations)).

### 10.3 What the subscriber signs

The subscriber's signature on `subscribe`, `extend`, `cancel` or `refresh_approval` covers the whole call tree. That includes the inner token `approve` with its exact amount and expiry, and the first-payment `transfer` at `subscribe`. Wallets should show these values to the user, read from the transaction itself.

The approve amount is the token's current allowance plus or minus the call's change, so it depends on the allowance at execution time. If anything changes the allowance between simulation and execution, the executed `approve` differs from the signed one and the call fails without effect: a charge lowers it, another signed call or a direct `approve` changes it. The wallet simulates again and asks for a new signature.

The approve expiry is the cap rounded down to a 720-ledger bucket, so it is almost always the same at simulation and execution; see [10.10](#1010-known-limitation-approve-expiry-mismatch) for the exception.

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
| `Executor(service_id)` | as the `Service` | a successful charge made by the executor |
| `WalletSubs`, `WalletSubCount` | minimum TTL | never; the `subscribe` that appends restores an archived page or count |

- `register_service` does not extend the new `Service`; it starts at the network minimum.
- `ActiveSub` and `TrialUsed` are written once at the network minimum and never extended.
- Ended subscriptions are allowed to archive.

| Entry | Storage | When it expires | Recoverable? |
|---|---|---|---|
| Token allowance | temporary | At its expiration ledger. Every signed call sets it to the cap, so it lapses about 180 days after the wallet's last signed call on this contract. | **No.** It is deleted and reads as 0. See 10.5. |
| `Sub`, `Service` of a live subscription | persistent | Kept live by charges and writes | Yes |
| `WalletSubs` pages, `WalletSubCount` | persistent | Archive after the minimum TTL | Yes: still readable; restored by the next `subscribe` |
| An ended subscription's entries, `ActiveSub`, `TrialUsed` | persistent | Archive after their TTL | Yes |
| Contract instance and code | instance / code | If nobody extends them | Yes |

On Pi, an archived persistent entry is not lost. It is still returned by reads and simulations, and the next transaction that touches it restores it automatically (the restore is paid by that transaction). So the guards still hold: a `subscribe` that needs an archived `ActiveSub` or `TrialUsed` restores it and checks it. Clients should treat "needs restore" as a normal case, not an error. Each archived entry a transaction touches counts as a disk read.

The contract does not store the allowance's expiry. Off-chain readers read it from the token's allowance entry (`["Allowance", {from, spender}]` → `{amount, live_until_ledger}`) and can prompt the subscriber before it lapses.

### 10.5 The shared allowance: threat analysis

The allowance is adjusted on top of the token's current value ([6.6](6-subscription-lifecycle.md#66-the-shared-allowance)). The contract never reads a stored total of its own, so anything that changes the token's number is carried forward by the next signed call.

| Event | Effect | Can a subscription take more than its own budget? |
|---|---|---|
| Direct revoke in the token (set to 0) | Charges return `ApprovalLost`, retried until their windows close. The next `subscribe` or `extend` adds only its own `price × periods` on top of 0. `refresh_approval` and `cancel` leave it at 0. | No |
| Direct lower in the token | Charges the allowance can no longer cover fail with `ChargeFailed` and are retried. Later signed calls add to or subtract from the lowered value; nothing restores the difference. | No |
| Direct raise in the token | Charges proceed as before. The extra amount is carried forward by later signed calls. | No: each charge is still exactly `price`, only within that subscription's `reserved` and window |
| Lapse: no signed call for about 180 days | The allowance reads 0. As for a revoke: charges return `ApprovalLost` and the next `subscribe` or `extend` adds only its own budget. | No |
| Allowance below the sum of live budgets (after any of the above) | Charges of different subscriptions compete for the shared number. A subscription's charge can use headroom the subscriber added for another subscription; the other one's charge then fails and is retried (10.11). | No |
| Ended subscription with budget left (missed window, service `Inactive`) | Its budget stays in the allowance (10.12). It cannot be charged. | No |

In every case, the per-subscription guards hold. A subscription can never pay more than `price` per period, more than its own `reserved`, or anyone other than its service's merchant. The wallet's total outflow through this contract is at most the sum of the budgets the subscriber authorized.

Recovery when a subscription's charges fail because the allowance is too low: the subscriber calls `extend` on it. That adds `price × periods` to both its budget and the allowance (see the limitation in 10.13). A wallet can compare the token's allowance with the sum of `whole(sub)` over its live subscriptions (read with `get_subscriptions`) and show "Approved X · Needed Y".

### 10.6 Executor key leak

An executor key can only call `process` for its service. If it leaks, an attacker can:

- charge subscriptions that are already due, exactly as the merchant would: one price per period, inside the window, to the merchant;
- spend the executor account's own balance on fees.

It cannot raise amounts, charge early, charge twice for a period, change the service, set another executor, or send funds anywhere but the merchant. The merchant removes or replaces it with `set_executor`.

The merchant key is more powerful: it can change service state and set the executor. Keep it offline and use an executor key for billing servers.

### 10.7 Subscriber protections

- `cancel` needs only the subscriber's signature. A subscriber can always stop future charges. Cancelling before a subscription ends also removes its remaining budget from the allowance.
- Service terms never change after sign-up. A merchant cannot raise the price on existing subscribers.
- Total charges never exceed the budget the subscriber approved (`price × periods`, plus any `extend`).
- A subscriber can also revoke the allowance in the token directly at any time. A revoked or expired allowance stops all charges for that subscriber (`ApprovalLost`). Charges resume only as far as later `subscribe` or `extend` calls, or a direct `approve`, add allowance back.

### 10.8 Upgrades

The admin can replace the contract code. New code could change any rule above. To make that visible:

- every upgrade is proposed first and can be applied only after a 7-day timelock ([8.2](8-admin-methods.md#82-upgrades-7-day-timelock));
- the pending upgrade, with its WASM hash, can be read by anyone with `get_pending_upgrade`;
- during those 7 days, subscribers can `cancel` or revoke their allowance, and merchants can stop billing.

The admin role itself moves only through a two-step handover.

### 10.9 Limits

- No limit on live subscriptions per wallet. A subscriber-signed call reads the token's allowance and touches only the subscription it changes and, for `subscribe`, the wallet index. Its cost does not grow with the number of live subscriptions.
- At most 15 items per `process` call (`ProcessLimitTooHigh`), sized for Pi Testnet's per-transaction limits. Billing clients should simulate each batch and split it if it exceeds a limit.
- `get_subscriptions` reads at most 50 ids per call (`TooManyIds`).

### 10.10 Known limitation: approve expiry mismatch

The approve expiry is the cap, `current_ledger + max_ttl − 1`, rounded down to a 720-ledger bucket. It is normally the same at simulation and at execution. If the ledger at execution falls in a later 720-ledger bucket than at simulation, the executed `approve` expiry differs from the simulated one. The subscriber's signed authorization then no longer matches, and the transaction fails with an auth error. This affects a small fraction of signed calls (estimated at 0.1–0.4%).

Nothing changes on-chain when this happens. Clients should treat this auth error as "simulate again and sign again", and retry automatically. The same applies when the allowance changed between simulation and execution (10.3).

### 10.11 Accepted limitation: the shared number

The token allowance is one number per (wallet, contract). It can fall below the sum of the live budgets after an expiry, a direct revoke or lower, or a lapse past about 180 days. Then:

- charges of different subscriptions compete for it, first come first served;
- a subscription's legitimate charge can use headroom the subscriber added when signing for **another** subscription;
- that other subscription's charge then fails (`ChargeFailed` or `ApprovalLost`). It is retried, and no money is lost.

Example: the allowance lapses while A and B are live. The subscriber then subscribes to C, so the allowance becomes `0 + C's budget`. A and B are due first and charge from that headroom, each within its own budget. When C is due, the allowance is too low and C's charge fails. Recovery: the subscriber extends C. See also the diagram in [2.5](2-overview.md#25-the-shared-allowance-over-time).

No subscription ever pays more than its own budget.

### 10.12 Accepted limitation: lingering budget

A subscription can end without being charged: its window passes, or its service becomes `Inactive`. Its remaining budget stays in the allowance. The contract does not clean it up for now.

- The ended subscription can never spend it: the charge rule refuses ended subscriptions.
- It adds headroom that other live subscriptions can use, each within its own budget.
- `cancel` before a subscription ends removes its budget from the allowance; `cancel` after it ends changes nothing.
- The subscriber can lower the allowance directly in the token at any time.

With the cap expiry, the allowance, including any lingering budget, lapses about 180 days after the wallet's last signed call.

### 10.13 Accepted limitation: no way to re-cover an existing budget

After a lapse or a direct revoke, the allowance is 0 while subscriptions may still have budget left. The contract offers no call that adds those existing budgets back:

- `refresh_approval` approves `current`, which is 0;
- `extend` adds only `price × periods`, and raises the subscription's `reserved` by the same amount.

Example: a subscription with 6 prices left loses its allowance. The subscriber can make it chargeable again only through `extend`, and each extension also increases what the subscriber committed. A direct `approve` in the token is the other way back.

This is a liveness and user-experience gap, not a money risk: no subscription can take more than its `reserved`. A fix is under discussion and not specified in this revision.

### 10.14 Known behaviour (review findings)

| Behaviour | Detail | What clients should do |
|---|---|---|
| Lingering allowance only grows while the wallet is active | Budget of subscriptions that end without being charged stays in the allowance (10.12). Every `subscribe` and `extend` adds on top of it, and only `cancel` before the end or a direct `approve` lowers it. As long as the wallet keeps signing, the cap expiry keeps renewing it. If a per-subscription guard or a future upgrade were faulty, the exposure would be the whole lingering allowance, not just the live budgets. | The wallet should show "Approved X · Needed Y" (Needed = sum of `whole(sub)` over live subscriptions) and offer a direct `approve` down to Needed when X is higher. |
| A concurrent charge between simulation and execution | A charge that lands after the subscriber's call was simulated lowers `current`. The executed `approve` amount then differs from the signed one, and the signed call fails with an auth error. Nothing changes on-chain. | Re-simulate and re-sign, as in 10.10. |
| `cancel` under contention | When the allowance is below the sum of the live budgets (10.11), `cancel` subtracts the cancelled subscription's whole remaining budget. That can remove headroom that other live subscriptions were using, so their next charges fail (`ChargeFailed` or `ApprovalLost`, retried). No subscription pays more than its own budget. | After a `cancel`, compare Approved with Needed and offer `extend` (or a direct `approve`) for subscriptions that are no longer covered. |

### 10.15 Possible later upgrades

- A way to re-cover existing budgets after a lapse or revoke (10.13). Under discussion.
- Cleaning up lingering budget of ended subscriptions. An in-ledger allowance sync was designed (the day-bucket design, archived on branch `ref-subscription-day-buckets-PI-14957`) and is not part of this revision.

Back to: [`ReadMe`](ReadMe.md)
