## 4. Error Codes

| Code | Name | Description |
|---|---|---|
| 1 | `InvalidPrice` | Price must be > 0 |
| 2 | `InvalidPeriod` | `period_secs` and `approve_periods` must be > 0 |
| 3 | `AlreadySubscribed` | Active subscription to this service already exists |
| 4 | `SubscriptionNotFound` | Subscription ID does not exist |
| 5 | `ServiceNotFound` | Service ID does not exist or is inactive |
| 6 | `Unauthorized` | Caller is not authorized for this action |
| 7 | `AlreadyCancelled` | Subscription is already non-recurring |
| 8 | `TimestampOverflow` | Timestamp arithmetic would overflow `u64` |
| 9 | `NotServiceOwner` | Caller is not the merchant of this service |
| 10 | `InvalidServiceName` | Service name must not be empty |
| 11 | `SubscriptionExpired` | Cannot re-enable or extend an expired subscription |

Next: [`5-Constructor-and-Service-Management`](5-constructor-and-service-management.md)
