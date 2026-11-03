## 7. Query Methods

Read methods need no authorization and change nothing. Call them by simulating the transaction; there is no need to submit. They return view structs ([3.3](3-data-types.md#33-views)), never the stored records.

The contract keeps no lists of services or subscriptions, other than each subscriber's Pool. Apps keep their own index of `service_id`s and `sub_id`s and read live state with these methods.

| Method | Returns | Notes | Errors |
|---|---|---|---|
| `get_service(service_id: u64)` | `ServiceView` | Terms and state | `ServiceNotFound` |
| `get_subscription(sub_id: u64)` | `SubscriptionView` | Stored fields plus `status` | `SubscriptionNotFound`, `ServiceNotFound` |
| `get_subscriptions(sub_ids: Vec<u64>)` | `Vec<SubscriptionView>` | Up to 50 ids per call. Ids whose subscription or service is missing are skipped, so the result can be shorter than the input; match results by `sub_id`. | `TooManyIds` |
| `get_pool(subscriber: Address)` | `PoolView` | Live ids (ended ids filtered out) and `live_sum` | — |
| `get_active_sub(subscriber: Address, service_id: u64)` | `Option<u64>` | The most recent `sub_id` for (subscriber, service), if any | — |
| `has_used_trial(subscriber: Address, service_id: u64)` | `bool` | Whether this subscriber has had the trial for this service | — |
| `get_executor(service_id: u64)` | `Option<Address>` | The service's executor, if set | — |
| `get_pending_upgrade()` | `Option<PendingUpgrade>` | The pending upgrade, if any ([8.2](8-admin-methods.md#82-upgrades-7-day-timelock)) | — |
| `version()` | `u32` | Contract version: `1` | — |

Notes:

- `get_active_sub` returns the most recent subscription for the pair, whether or not it has ended. Read it with `get_subscription` and check `status`. An app can use it to find the existing subscription after `AlreadySubscribed`.
- `get_pool` filters ended ids at read time. The stored Pool may still hold them until the subscriber's next signed call.
- `status` depends on the current time. Do not cache it for long. It does not reflect the Pool or the token allowance: a subscription dropped by the approval gate can still read `Paid` or `Due` ([3.3](3-data-types.md#33-views)).
- Read methods do not call the token. To see the allowance amount and expiry, read the token's own allowance entry (`["Allowance", {from: subscriber, spender: contract}]` → `{amount, live_until_ledger}`), or call the token's `allowance(from, spender)` for the amount.
- Entries that have been archived on the network are still returned by reads and simulations ([10.4](10-security-considerations.md#104-storage-expiry)).
- Payment history and the reason a subscription ended are not stored. They come from the contract's events in the chain's transaction history ([3.5](3-data-types.md#35-events)).

Next: [`8-Admin-Methods`](8-admin-methods.md)
