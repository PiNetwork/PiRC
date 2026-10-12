## 2. Overview

A Soroban smart contract that manages **recurring payment subscriptions**. Merchants register services with configurable pricing and billing periods. Subscribers can subscribe with or without auto-renewal, and merchants process periodic charges via pre-approved token allowances.

```mermaid
flowchart LR
  subgraph A["Merchant"]
    M[Merchant] -->|register_service| S[Service]
  end

  subgraph B["Subscriber"]
    Sub[Subscriber] -->|subscribe| Subscription
  end

  subgraph C["Billing Cycle"]
    M -->|process\noffset, limit| Charge[Batch Charge]
    Charge -->|try_transfer_from| Token[Token Contract]
  end

  Subscription -->|linked to| S
  Subscription -->|token approve\nvia do_approve| Token
```

### Data Flow

```mermaid
flowchart TD
  %% ── 1. Service Registration ──
  subgraph S1["1. Service Registration"]
    M1[Merchant\ncalls register_service] --> V1{Validate\nprice > 0\nperiod_secs > 0\nname non-empty\napprove_periods > 0}
    V1 -- valid --> C1[Contract stores Service\nin persistent storage]
    V1 -- invalid --> Err1[InvalidPrice /\nInvalidPeriod /\nInvalidServiceName]
    C1 --> MS[Append service_id\nto MerchantServices list]
    C1 --> E1[Event: srv_reg]
  end

  %% ── 2. Subscribe ──
  subgraph S2["2. Subscribe"]
    Sub[Subscriber\ncalls subscribe] --> Active{Service\nis_active?}
    Active -- no --> ErrInactive[ServiceNotActive]
    Active -- yes --> Dedup{SubServicePair\nexists & active?}
    Dedup -- yes --> ErrDup[AlreadySubscribed]
    Dedup -- no --> Trial{trial_period_secs > 0?}

    Trial -- "yes + auto_renew" --> TA[do_approve:\napprove_periods × price\nextra_secs = trial duration]
    Trial -- "yes + !auto_renew" --> TO[Trial only\nNo approval, no payment]
    Trial -- "no + auto_renew" --> NA[Transfer 1st period to merchant\ndo_approve: approve_periods × price]
    Trial -- "no + !auto_renew" --> NO[Transfer 1st period to merchant\ndo_approve: 1 × price]

    TA --> Store[Store Subscription\n+ SubServicePair\n+ SubscriberSubs\n+ ServiceSubs]
    TO --> Store
    NA --> Store
    NO --> Store
    Store --> E2[Event: sub]
  end

  %% ── 3. Process — charge cycle ──
  subgraph S3["3. Process — batch charge"]
    M3[Merchant calls\nprocess\noffset, limit] --> Own{merchant ==\nservice.merchant?}
    Own -- no --> ErrOwn[NotServiceOwner]
    Own -- yes --> Iter[Iterate ServiceSubs\nfrom offset to offset+limit]
    Iter --> Each{For each sub}
    Each --> Skip1{!auto_renew?}
    Skip1 -- yes --> Skipped[skipped += 1]
    Skip1 -- no --> Skip2{now < next_charge_ts?}
    Skip2 -- yes --> Skipped
    Skip2 -- no --> TF[try_transfer_from\nsubscriber → merchant]
    TF --> Ok{Success?}
    Ok -- yes --> Advance["next_charge_ts += period_secs\nservice_end_ts = next_charge_ts\ncharged += 1\nEvent: charge"]
    Ok -- no --> Fail["auto_renew = false\nfailed += 1\nEvent: chg_fail"]
    Advance --> LowCheck["Check allowance & balance\nfor next cycle\nEvents: low_alw / low_bal"]
    Advance --> TrialCheck{Was trial\nfirst charge?}
    TrialCheck -- yes --> TrialEnd["Event: trl_end"]
  end

  %% ── 4. ProcessResult ──
  subgraph S4["4. ProcessResult returned"]
    PR["{ charged, failed, skipped, total }"]
  end

  S1 ~~~ S2
  S2 ~~~ S3
  S3 --> S4
```

### Key Concepts

- **Services** — Merchants define a service with a name, price per period, billing cycle duration, optional trial period, and a number of periods to pre-approve for recurring subscribers.
- **Subscriptions** — Subscribers choose a service and opt in with or without auto-renewal (`auto_renew`). The contract manages token approvals, payments, and lifecycle transitions.
- **Batch Processing** — Merchants call `process(offset, limit)` to charge due subscriptions for a given service in paginated batches. Failed payments automatically set `auto_renew = false`.
- **Token Allowances** — Payments use the `try_transfer_from` pattern with pre-approved allowances, enabling non-custodial recurring charges. Approval expiration is rounded to 720-ledger buckets for simulate/execute consistency.
- **Dedup & Trial Guard** — `SubServicePair` prevents duplicate active subscriptions. Subscribers who already used a free trial cannot re-subscribe without `auto_renew = true`.
- **No Drift** — On successful charge, `next_charge_ts` advances from its previous value (not from current time), preventing billing drift.

Next: [`3-Data-Types`](3-data-types.md)
