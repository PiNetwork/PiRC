## 10. Security Considerations

This section outlines security considerations, potential attack vectors, and recommended mitigations for implementations of the PiRC2 Subscription Contract. The goal is to help developers, auditors, and the community evaluate the contract's security posture.

### 10.1 Token Allowance & Approval Risks

#### Over-Approval Exposure

When a subscriber calls `subscribe` with `auto_renew = true`, the contract issues a token approval for `approve_periods * price`. If a subscriber sets a high `approve_periods` value, the contract holds a large spending allowance over the subscriber's wallet.

**Mitigations:**
- The contract only draws down the allowance one period at a time via `try_transfer_from`, so the full approved amount is never transferred at once.
- Subscribers retain the ability to revoke or reduce their token approval at the Soroban token level at any time.
- Implementations SHOULD surface the total approved amount clearly in the UI so subscribers understand their exposure.

**Recommendation:** Consider adding an optional `max_approve_periods` field to the `Service` struct, allowing merchants to cap the maximum approval horizon. This gives subscribers confidence that approval is bounded.

#### Approval Expiration — 720-Ledger Bucket Rounding

The contract rounds approval expiration to 720-ledger buckets for simulate/execute consistency. This means an approval may persist for up to 720 ledgers (~60 minutes) beyond the intended expiration.

**Consideration:** This is an acceptable trade-off for consistency, but integrators should be aware that the effective approval window is slightly larger than the nominal period.

### 10.2 Batch Processing & Denial of Service

#### Unbounded Iteration Risk

The `process(offset, limit)` method iterates over subscriptions for a given service. If `limit` is set excessively high and the service has many subscribers, this could exceed Soroban's per-invocation resource limits (CPU, memory, or ledger reads).

**Mitigations:**
- The `offset` and `limit` pagination pattern already addresses this by allowing merchants to process in batches.
- Implementations SHOULD enforce a reasonable maximum `limit` (e.g., 100-200) either in the contract or at the application layer.

**Recommendation:** The contract could enforce a hard `MAX_BATCH_SIZE` constant to prevent accidental or malicious resource exhaustion.

#### Failed Payment Cascades

When `try_transfer_from` fails for a subscriber, the contract sets `auto_renew = false` and increments `failed`. If a merchant processes in rapid succession without checking `ProcessResult`, they may not notice a wave of failures.

**Recommendation:** Integrators SHOULD monitor the `chg_fail` event and alert merchants when the failure rate exceeds a threshold (e.g., >10% of processed subscriptions).

### 10.3 Access Control

#### Merchant Identity Verification

The contract uses `Address` for merchant identity and Soroban's `require_auth()` for authorization. There is no on-chain identity verification — any address can register a service.

**Considerations:**
- Applications built on PiRC2 SHOULD implement off-chain merchant verification before surfacing services to subscribers.
- The `admin` role (used for `upgrade`) is a single address. Loss of the admin key would prevent contract upgrades, while compromise would allow malicious WASM replacement.

**Recommendation:** For production deployments, consider a multi-signature or time-locked admin pattern to reduce single-point-of-failure risk for the `upgrade` function.

#### Subscription Privacy

`get_subscription` is restricted to the subscriber or the service's merchant, which is good. However, `get_merchant_subs` and `get_subscriber_subs` require auth, and `is_subscription_active` is a public read.

**Consideration:** An observer can determine if a given `(subscriber, service_id)` pair has an active subscription by calling `is_subscription_active`. Depending on the use case, this may have privacy implications (e.g., revealing a subscriber's service usage patterns). If privacy is a concern, the specification could discuss optional obfuscation strategies.

### 10.4 Economic & Game-Theory Attacks

#### Front-Running `process()` with `cancel()`

A subscriber could watch the mempool and call `cancel()` just before a merchant's `process()` transaction lands. Since `cancel()` sets `auto_renew = false`, the next `process()` would skip that subscription.

**Mitigations:**
- The PiRC2 design already handles this gracefully: on cancellation, any remaining paid time (`service_end_ts`) is preserved. The subscriber has already paid for the current period.
- The merchant loses only *future* revenue, not current-period payment.

**Consideration:** This is inherent to any on-chain subscription model and not a vulnerability per se, but merchants should be aware of this dynamic when forecasting recurring revenue.

#### Price Locking at Subscription Time

The `price` is copied into the `Subscription` struct at subscribe time. If a merchant updates the service price (by deactivating and re-registering), existing subscribers retain their original price.

**Consideration:** This is a subscriber-friendly design choice. Merchants who need to change pricing must manage migration carefully — potentially notifying subscribers and offering a re-subscribe flow.

### 10.5 Timestamp Dependence

The contract relies on ledger timestamps for billing logic (`next_charge_ts`, `service_end_ts`, `trial_end_ts`). Ledger timestamps on Stellar/Soroban are determined by validator consensus and can have small variations.

**Mitigations:**
- The "no drift" design (advancing `next_charge_ts` from its previous value rather than `now`) prevents cumulative timing errors.
- The `TimestampOverflow` error (code 8) guards against arithmetic overflow in timestamp calculations.

**Recommendation:** Integrators SHOULD NOT rely on sub-minute precision for billing events. The contract's period-based design (typically hours/days/months) provides sufficient granularity for real-world subscription models.

### 10.6 Contract Upgrade Security

The `upgrade` function allows the admin to replace the contract WASM. This is a powerful capability with significant trust implications.

**Recommendations:**
- The `upgrade` event includes the `new_wasm_hash`, enabling external verification of upgrades.
- Auditors and the community SHOULD verify the WASM hash against published source code before and after any upgrade.
- Consider implementing a time-lock or governance vote mechanism for upgrades in future PiRC iterations.

### 10.7 Integration Security Checklist

For developers building on PiRC2:

| # | Check | Priority |
|---|-------|----------|
| 1 | Validate `approve_periods` is reasonable for the service's billing cycle | High |
| 2 | Display total token approval amount to subscriber before signing | High |
| 3 | Monitor `chg_fail`, `low_alw`, and `low_bal` events for proactive alerting | High |
| 4 | Enforce a maximum `limit` when calling `process()` | Medium |
| 5 | Implement off-chain merchant identity verification | Medium |
| 6 | Verify contract WASM hash after any `upgrade` event | Medium |
| 7 | Handle `AlreadySubscribed` (error 3) gracefully for returning subscribers | Low |
| 8 | Consider privacy implications of public `is_subscription_active` queries | Low |

Next: Return to [`ReadMe`](ReadMe.md)