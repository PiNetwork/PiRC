## 1. Introduction

This PiRC2 requests comments on the design and reference implementation (source code) of **subscription support**, Pi Network's first smart contract capability.

Subscriptions are one of the most common business models among services in modern society, but they have been difficult to implement on blockchain systems. The subscription smart contract gives developers and businesses a way to build recurring service models into applications or their local commerce while processing the payments through the blockchain and preserving subscriber control over funds.

The reference implementation (source code) is available in [`PiNetwork/SmartContracts`](https://github.com/PiNetwork/SmartContracts/) under `contracts/subscription/`.
The smart contract is being reviewed by external auditing services; in addition, we request the community to review the code and help identify any bugs or vulnerabilities.

### 1.1 How It Works

A key part of the design is that subscribers can approve a defined budget for the contract to use, without needing to re-sign every billing event. That approval can also be limited to a defined billing horizon, such as monthly charges for up to one year. At the same time, the approved funds remain in the user's wallet until charges are actually processed. As long as the wallet has enough balance when a charge comes due, the subscription remains in effect, instead of requiring the full budget to be locked up in advance.

This allows the contract to support recurring payments without giving up the wallet-level control that blockchain systems are meant to preserve or sending the total budget out to the contract.

### 1.2 Use Cases

By bringing subscriptions to the ecosystem using Pi's smart contract capability, Pi is fostering use cases that map directly to real products and recurring utility-driven services built on blockchain such as subscriptions for AI products, productivity tools, digital content memberships, streaming, e-commerce, local commerce memberships, and more.

### 1.3 The Technical Innovation

Subscriptions are not a new idea, but they have usually involved tradeoffs on the blockchain. In most blockchain systems, each transfer of funds is a separate transaction that requires explicit authorization (typically a new user signature) at the time it is executed. That requirement is the opposite of a subscription, which is meant to run automatically on a schedule without requiring the subscriber to manually re-approve every billing event. As a result, proposed recurring-payment standards have often relied on tradeoffs such as off-chain coordination, risky pre-signed transactions, repeated authorization, pre-funding, or added account infrastructure.

Pi's model takes a different approach. It is designed to let subscriptions work without requiring a new signature for every billing event, while still keeping the approved funds in the subscriber's wallet until billing actually happens. This is a meaningful design choice in Web3, where recurring payments have often been harder to implement cleanly without adding friction, pre-funding, or extra infrastructure.

This innovation is enabled by Soroban's token allowance mechanism: a subscriber can `approve` a contract as a spender for a given amount (optionally with an `expiration_ledger`), and the contract can later draw down that allowance over time (e.g., via `transfer_from`) without transferring or locking the full budget upfront. When a charge is processed, the smart contract mediates the payment and transfers the subscription amount directly to the merchant.

Next: [`2-Overview`](2-overview.md)
