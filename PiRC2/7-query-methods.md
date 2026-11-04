## 7. Query Methods

Read methods need no authorization and change nothing. Call them by simulating the transaction; there is no need to submit. They return view structs ([3.3](3-data-types.md#33-views-and-results)), never the stored records.

The contract keeps no per-service or per-merchant lists. For each wallet it keeps an append-only index of every `sub_id` the wallet created (`get_wallet_sub_ids`), including subscriptions created by calling the contract directly. Apps keep their own index of `service_id`s and `sub_id`s and read live state with these methods.

| Method | Returns | Notes | Errors |
|---|---|---|---|
| `get_service(service_id: u64)` | `ServiceView` | Terms and state | `ServiceNotFound` |
| `get_subscription(sub_id: u64)` | `SubscriptionView` | Stored fields plus `status` | `SubscriptionNotFound`, `ServiceNotFound` |
| `get_subscriptions(sub_ids: Vec<u64>)` | `Vec<SubscriptionView>` | Up to 50 ids per call. Ids whose subscription or service is missing are skipped, so the result can be shorter than the input; match results by `sub_id`. | `TooManyIds` |
| `get_allowance(subscriber: Address)` | `AllowanceView` | `total`, `clean_through_day`, `pending_days` (past buckets the next signed call will clean), `max_close`. A wallet with no record reads as zeros with `clean_through_day = today`. | — |
| `get_wallet_sub_ids(subscriber: Address, page: u32)` | `Vec<u64>` | Up to 50 `sub_id`s in creation order. Page `p` holds ids `50p` to `50p + 49`. A missing page returns an empty list. | — |
| `get_wallet_sub_count(subscriber: Address)` | `u64` | Number of subscriptions the wallet ever created. The last page is `count / 50`, rounded down. | — |
| `get_active_sub(subscriber: Address, service_id: u64)` | `Option<u64>` | The most recent `sub_id` for (subscriber, service), if any | — |
| `has_used_trial(subscriber: Address, service_id: u64)` | `bool` | Whether this subscriber has had the trial for this service | — |
| `get_executor(service_id: u64)` | `Option<Address>` | The service's executor, if set | — |
| `get_pending_upgrade()` | `Option<PendingUpgrade>` | The pending upgrade, if any ([8.2](8-admin-methods.md#82-upgrades-7-day-timelock)) | — |
| `version()` | `u32` | Contract version: `1` | — |

Notes:

- `get_active_sub` returns the most recent subscription for the pair, whether or not it has ended. Read it with `get_subscription` and check `status`. An app can use it to find the existing subscription after `AlreadySubscribed`.
- `get_allowance(...).total` can include ended subscriptions until cleanup releases their day. `pending_days > 0` means the next signed call (for example `refresh_approval`) will lower it.
- `get_wallet_sub_ids` lists every subscription, ended ones included. Read each with `get_subscriptions` to get its status.
- `WalletSubs` pages and `WalletSubCount` are never extended. Once archived they are still returned by reads and simulations.
- `status` depends on the current time. Do not cache it for long. It does not reflect the token allowance: a subscription whose allowance expired or was revoked can still read `Due` ([3.3](3-data-types.md#33-views-and-results)).
- Read methods do not call the token. To see the allowance amount and expiry, read the token's own allowance entry (`["Allowance", {from: subscriber, spender: contract}]` → `{amount, live_until_ledger}`), or call the token's `allowance(from, spender)` for the amount.
- Entries that have been archived on the network are still returned by reads and simulations ([10.4](10-security-considerations.md#104-storage-expiry)).
- Payment history is not stored. It comes from the contract's events in the chain's transaction history ([3.5](3-data-types.md#35-events)). Why a subscription ended is not stored either; it follows from its final state (see [6.8](6-subscription-lifecycle.md#68-status)).

Next: [`8-Admin-Methods`](8-admin-methods.md)
