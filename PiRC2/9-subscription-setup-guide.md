## 9. Subscription Setup Guide

This guide calls the contract from the command line on Pi Testnet with the Stellar CLI.

> **The new contract is not deployed yet.** Its Pi Testnet address will be announced. Until then, the examples use `$CONTRACT_ID` as a placeholder. You can deploy your own copy from the reference implementation to try them (9.3).
>
> The contract at `CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV`, used by the earlier draft, is deprecated. Its methods (`pay_upfront`, `toggle_pay_upfront`, `extend_subscription`, `process(merchant, service_id)`, list queries) do not exist on the new contract.

Most apps should not call the contract directly: use `Pi.Subscriptions.subscribe` from the Pi SDK ([1.5](1-introduction.md#15-how-apps-use-it)). This guide is for reviewers, merchants testing billing, and tool builders.

### 9.1 Environment setup

**1. Install the Stellar CLI**

```bash
# macOS
brew install stellar-cli
# Linux / Windows (WSL)
cargo install --locked stellar-cli
```

Full guide: [Install the CLI | Stellar Docs](https://developers.stellar.org/docs/tools/cli/install-cli).

**2. Add Pi Testnet**

```bash
stellar network add pi-testnet \
  --rpc-url https://rpc.testnet.minepi.com \
  --network-passphrase "Pi Testnet"
```

Or create `~/.stellar/network/pi-testnet.toml`:

```toml
rpc_url = "https://rpc.testnet.minepi.com"
rpc_headers = []
network_passphrase = "Pi Testnet"
```

**3. Create identities**

```bash
stellar keys generate merchant
stellar keys generate subscriber
stellar keys generate executor     # optional: process-only billing key
```

Fund each address with Testnet Pi before use. Fees are paid by the transaction's source account: the subscriber pays for its own calls, and the merchant or executor pays for `process`.

**4. Environment variables**

```bash
export NETWORK=pi-testnet
export CONTRACT_ID=<SUBSCRIPTION_CONTRACT_ID>      # announced at deploy
export MERCHANT=$(stellar keys address merchant)
export SUBSCRIBER=$(stellar keys address subscriber)
export EXECUTOR=$(stellar keys address executor)
```

Amounts are in the token's smallest unit. Pi has 7 decimal places: `10000000` = 1 Pi. Times are in seconds.

### 9.2 Typical flow

```
1. Merchant:   register_service(merchant, price, period_secs, trial_period_secs)  -> service_id
2. Merchant:   set_executor(merchant, service_id, executor)                       (optional)
3. Subscriber: subscribe(subscriber, service_id, periods, claim_trial)            -> {sub_id, cleanup}
               cleanup of past days; trial, or first payment now;
               item added to the deadline's day bucket; allowance set to total
4. Billing:    get_subscription(sub_id)                                           -> period_end_ts
               once period_end_ts has passed (status Due):
               process(caller, service_id, [{sub_id, expected_period_end}])       -> [{sub_id, outcome}]
5. Subscriber: extend(subscriber, sub_id, periods, expected_period_end)           -> CleanupReport; add periods
               refresh_approval(subscriber)                                       -> CleanupReport; clean up,
                                                                                  renew or restore the allowance
6. Subscriber: cancel(subscriber, sub_id)                                         -> CleanupReport; no more charges;
                                                                                  access lasts to period_end_ts
```

### 9.3 Deploy your own copy (optional)

Build the WASM from the reference implementation (`PiCoreTeam/pi-smartcontracts`, `contracts/subscription`). Until PR #5 is updated to this revision, it builds the earlier `Pool` version, whose storage, return types and reads differ from this guide.


```bash
stellar contract build    # -> target/wasm32v1-none/release/subscription.wasm
```

Then deploy it with the Pi native token as the payment token:

```bash
export TOKEN_ID=$(stellar contract id asset --asset native --network $NETWORK)

stellar contract deploy \
  --wasm target/wasm32v1-none/release/subscription.wasm \
  --source merchant \
  --network $NETWORK \
  -- \
  --admin $MERCHANT \
  --token $TOKEN_ID
```

The command prints the new contract id. Use it as `$CONTRACT_ID`.

### 9.4 Merchant: register and manage a service

**Register a service.** 5 Pi every 30 days, with a 7-day free trial. Returns the `service_id`.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source merchant \
  -- register_service \
  --merchant $MERCHANT \
  --price 50000000 \
  --period_secs 2592000 \
  --trial_period_secs 604800
```

Use `--trial_period_secs 0` for no trial.

**Set an executor.** Lets the executor key call `process` for this service.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source merchant \
  -- set_executor \
  --merchant $MERCHANT \
  --service_id 0 \
  --executor $EXECUTOR
```

Omit `--executor` to pass `None` and remove the executor.

**Close or reopen sign-ups, or stop the service.**

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source merchant \
  -- set_service_state \
  --merchant $MERCHANT \
  --service_id 0 \
  --state '"SignupsClosed"'
```

Valid values: `"Open"`, `"SignupsClosed"`, `"Inactive"`. `"Inactive"` is final.

### 9.5 Subscriber: subscribe, extend, cancel

**Subscribe** with a budget of 12 periods and claim the trial. Returns a `SubscribeResult`: the `sub_id` and the `CleanupReport` of ended subscriptions released by this call, for example `{"sub_id":0,"cleanup":{"days_cleared":0,"released":"0","more":false}}`.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source subscriber \
  -- subscribe \
  --subscriber $SUBSCRIBER \
  --service_id 0 \
  --periods 12 \
  --claim_trial true
```

With a trial: nothing is paid now; `period_end_ts` is 7 days from now. Without a trial (or with `--claim_trial false`): 5 Pi goes to the merchant now; `period_end_ts` is 30 days from now. Either way `reserved` is 60 Pi. The subscription goes into the day bucket of its deadline (`period_end_ts + period_secs`), and the allowance is set to the wallet's new `total`.

Check first whether the trial is still available:

```bash
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- has_used_trial --subscriber $SUBSCRIBER --service_id 0
```

**Extend** by 6 periods. Pass the current `period_end_ts` from `get_subscription`. Only a subscription that has not ended can be extended. `--periods 0` only re-approves. Returns a `CleanupReport`.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source subscriber \
  -- extend \
  --subscriber $SUBSCRIBER \
  --sub_id 0 \
  --periods 6 \
  --expected_period_end <PERIOD_END_TS>
```

Fails with `PeriodMismatch` if a charge moved `period_end_ts` since you read it. Read again and retry.

**Refresh the approval** (renew the allowance's expiry, release ended subscriptions, or restore billing after the allowance expired or was revoked). It returns a `CleanupReport`; if `more` is `true`, run it again to clean the next 40 days.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source subscriber \
  -- refresh_approval \
  --subscriber $SUBSCRIBER
```

**Cancel.** No more charges; access lasts to `period_end_ts`.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source subscriber \
  -- cancel \
  --subscriber $SUBSCRIBER \
  --sub_id 0
```

### 9.6 Billing: process

Read the subscription to get its `period_end_ts`:

```bash
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source executor \
  -- get_subscription --sub_id 0
```

Once `now >= period_end_ts` (status `Due`), charge it. Each item carries the `period_end_ts` you read as `expected_period_end`. Up to 15 items per call.

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --network $NETWORK \
  --source executor \
  -- process \
  --caller $EXECUTOR \
  --service_id 0 \
  --items '[{"sub_id":0,"expected_period_end":<PERIOD_END_TS>},{"sub_id":1,"expected_period_end":<PERIOD_END_TS_1>}]'
```

The merchant can run the same call with `--source merchant --caller $MERCHANT`.

The result lists one outcome per item, for example:

```json
[{"sub_id":0,"outcome":"Charged"},{"sub_id":1,"outcome":"NotDue"}]
```

Running the same command again returns `AlreadyHandled` for item 0 and charges nothing. An item that returns `ChargeFailed` is unchanged: send it again in a later run, with the same `expected_period_end`, until its window closes. An item that returns `ApprovalLost` is also unchanged: the subscriber's allowance is 0 (expired or revoked). Retry it after the subscriber signs any call, such as `refresh_approval`, which re-approves `total`. A successful charge moves the subscription to the next period's day bucket; no other outcome changes anything. See [6.5](6-subscription-lifecycle.md#65-process-batch-charge) for every outcome.

### 9.7 Reads

Reads are simulated, not submitted. Any funded identity can be the source.

```bash
# Service terms and state
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_service --service_id 0

# One subscription, with its derived status
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_subscription --sub_id 0

# Several subscriptions (up to 50; missing ids skipped)
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_subscriptions --sub_ids '[0,1,2]'

# The wallet's allowance summary: total, cleanup backlog (pending_days), max_close
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_allowance --subscriber $SUBSCRIBER

# Every subscription the wallet ever created: count, then pages of 50 ids
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_wallet_sub_count --subscriber $SUBSCRIBER
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_wallet_sub_ids --subscriber $SUBSCRIBER --page 0

# The subscription recorded for (subscriber, service)
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_active_sub --subscriber $SUBSCRIBER --service_id 0

# The service's executor
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_executor --service_id 0

# Pending upgrade, if any
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- get_pending_upgrade

# Contract version (1)
stellar contract invoke --id $CONTRACT_ID --network $NETWORK --source subscriber \
  -- version
```

To compare the allowance the token holds with `get_allowance(...).total`, read it from the token:

```bash
stellar contract invoke --id $TOKEN_ID --network $NETWORK --source subscriber \
  -- allowance --from $SUBSCRIBER --spender $CONTRACT_ID
```

### 9.8 Common errors

| Error | Usual cause | Fix |
|---|---|---|
| `ServiceNotOpen` (7) | Sign-ups closed or service `Inactive` | Use an `Open` service |
| `AlreadySubscribed` (3) | A live subscription exists for this service, including a cancelled one still inside its period | Use `get_active_sub` to find it; `extend` it instead |
| `PeriodMismatch` (16) | A charge landed since you read `period_end_ts` | Read again and retry |
| `SubscriptionEnded` (11) | `extend` on a subscription that has ended | Subscribe again (if the service is `Open`) |
| `TooManyIds` (22) | `get_subscriptions` with more than 50 ids | Split the read |
| `NotProcessExecutor` (10) | `process` from a key that is neither merchant nor executor | Use the merchant key or set the executor |
| `ProcessLimitTooHigh` (13) | More than 15 items | Split the batch |
| Host auth error on a signed call | The approve expiry crossed a 720-ledger bucket ([10.10](10-security-considerations.md#1010-known-limitation-approve-expiry-mismatch)), or a UTC midnight passed ([10.11](10-security-considerations.md#1011-known-limitation-utc-midnight-between-simulation-and-execution)), between simulation and execution | Simulate again, sign again, resubmit |

The full list is in [4. Error Codes](4-error-codes.md).

Next: [`10-Security-Considerations`](10-security-considerations.md)
