# PiRC2: Subscription Contract API (Pi Request for Comment)

> **Revision note (round 6, 2026-11-05).** There is no in-ledger allowance sync. The shared token allowance is adjusted on top of its current value: plus the new budget on `subscribe` and `extend`, minus the remaining budget on `cancel`, with the expiry always at the cap. Per-subscription guards bound every charge. The `WalletSubs` index is kept. This replaces the per-wallet `Pool` and the day-bucket designs. The day-bucket design is archived on branch `ref-subscription-day-buckets-PI-14957` in `PiCoreTeam/pi-smartcontracts`. Reference implementation: PR #5 in `PiCoreTeam/pi-smartcontracts` (being updated to this revision).

This document specifies the Subscription Contract API: a Soroban smart contract that runs recurring payment subscriptions on Pi Network. It defines how merchants register services with a fixed price and billing period, how subscribers set a budget for a subscription without sending funds anywhere, and how merchants collect each period's payment from that budget.

This version replaces the earlier PiRC2 draft completely. The earlier draft described a contract with `pay_upfront`, `toggle_pay_upfront`, `process(merchant, service_id)` and subscription lists stored on-chain. That design is deprecated. See [1.4 What changed](1-introduction.md#14-what-changed-from-the-earlier-draft).

Community feedback is welcome. Pioneers are encouraged to review, comment, and share specific suggestions through GitHub Issues, discussions, or Pull Requests.

## Table of contents

  - [`1-introduction`](1-introduction.md) **(start here)**
  - [`2-overview`](2-overview.md)
  - [`3-data-types`](3-data-types.md)
  - [`4-error-codes`](4-error-codes.md)
  - [`5-constructor-and-service-management`](5-constructor-and-service-management.md)
  - [`6-subscription-lifecycle`](6-subscription-lifecycle.md)
  - [`7-query-methods`](7-query-methods.md)
  - [`8-admin-methods`](8-admin-methods.md)
  - [`9-subscription-setup-guide`](9-subscription-setup-guide.md)
  - [`10-security-considerations`](10-security-considerations.md)
