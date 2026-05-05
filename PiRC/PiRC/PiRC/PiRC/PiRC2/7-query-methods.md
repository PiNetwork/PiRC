## 7. Query Methods

### 7.1 `get_subscription(caller, sub_id) -> Subscription`

Returns subscription details. Caller must be the subscriber or the service merchant.

**Errors:** `SubscriptionNotFound`, `Unauthorized`, `ServiceNotFound`

### 7.2 `get_subscriber_subs(subscriber) -> Vec<Subscription>`

Returns all subscriptions for a subscriber. Requires `subscriber` authorization.

### 7.3 `get_merchant_subs(merchant, service_id) -> Vec<Subscription>`

Returns all subscriptions for a specific service. Requires `merchant` authorization; must be the service owner.

**Errors:** `ServiceNotFound`, `NotServiceOwner`

### 7.4 `get_service(service_id) -> Service`

Returns service details. No authorization required.

**Errors:** `ServiceNotFound`

### 7.5 `get_merchant_services(merchant) -> Vec<Service>`

Returns all services owned by a merchant. No authorization required.

### 7.6 `is_subscription_active(subscriber, service_id) -> bool`

Returns `true` if the subscriber has an active subscription (current time < `service_end_ts`). No authorization required.

Next: [`8-Admin-Methods`](8-admin-methods.md)
