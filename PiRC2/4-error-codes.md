## 4. Error Codes

Errors are a `#[contracterror]` enum. Codes are append-only: a code is never reused, renamed or removed.

| Code | Name | When |
|---|---|---|
| 1 | `InvalidPrice` | `price <= 0` |
| 2 | `InvalidPeriod` | `period_secs == 0` |
| 3 | `AlreadySubscribed` | A live subscription exists for (subscriber, service) |
| 4 | `SubscriptionNotFound` | No subscription with this `sub_id` |
| 5 | `ServiceNotFound` | No service with this `service_id` |
| 6 | `Unauthorized` | Caller is not the subscription's subscriber |
| 7 | `ServiceNotOpen` | `subscribe` on a `SignupsClosed` or `Inactive` service |
| 8 | `TimestampOverflow` | Timestamp arithmetic would overflow `u64` (`subscribe`, `propose_upgrade`) |
| 9 | `NotServiceOwner` | A merchant-only call by someone other than the service's merchant |
| 10 | `NotProcessExecutor` | `process` caller is neither the merchant nor the service's executor |
| 11 | `SubscriptionEnded` | `extend` on a subscription that has ended (window closed, service `Inactive`, or past `period_end_ts` with `reserved < price`) |
| 12 | `InvalidStateTransition` | Leaving `Inactive`, or setting `Inactive` again |
| 13 | `ProcessLimitTooHigh` | `process` with more than 15 items |
| 14 | `AmountOverflow` | Amount arithmetic would overflow `i128` (`price × periods`, `reserved` or the live sum) |
| 15 | `PoolFull` | The subscriber already has 50 other live subscriptions (`subscribe`, `extend`) |
| 16 | `PeriodMismatch` | `extend`'s `expected_period_end` is not the stored `period_end_ts` |
| 17 | `NoAdminProposed` | `accept_admin` with no pending admin |
| 18 | `NotProposedAdmin` | `accept_admin` by an address other than the proposed one |
| 19 | `NoUpgradeProposed` | `apply_upgrade` or `cancel_upgrade` with no pending upgrade |
| 20 | `UpgradeTimelockNotElapsed` | `apply_upgrade` before `apply_after_ts` |
| 21 | `UpgradeAlreadyPending` | `propose_upgrade` while another upgrade is pending |
| 22 | `TooManyIds` | `get_subscriptions` with more than 50 ids |

A failed authorization (`require_auth`) aborts the call with the host's own auth error, not one of these codes.

`process` never fails because of a single item. Item problems are reported as a `ChargeOutcome` ([3.4](3-data-types.md#34-billing-types)).

Next: [`5-Constructor-and-Service-Management`](5-constructor-and-service-management.md)
