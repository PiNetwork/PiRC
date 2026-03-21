# Security & Penalty Guidelines – Pi Hybrid Token

## Overview
This document outlines the **security framework and penalty mechanisms** for the Pi Hybrid Token ecosystem. It covers:

- Reward suspension  
- Allocation reduction  
- Slashing (from minor to repeated violations)  
- Permanent bans  

All mechanisms emphasize transparency, auditability, and community governance.

---

## 1. Reputation & Penalty Principles

### 1.1 Adjusting Reputation
- When reducing a participant's allocation:  
```text
reputationImpact = amount * 100 / piBalance[participant]
```
- Ensure the participant’s balance is checked to prevent **division by zero**.  
- The recommended order of operations:  
  1. Deduct allocation  
  2. Update balance  
  3. Apply reputation adjustment  
- Goal: encourage responsible behavior and fairness.

### 1.2 Penalty Categories
| Category | Purpose | Managed By |
|----------|---------|------------|
| Financial | Reduce token rewards | Owner / Multi-sig |
| Reputation | Lower participant reputation score | Owner / Multi-sig |
| Governance | Suspend voting rights temporarily | Community vote |
| Permanent Ban | Block participant from ecosystem | Trust-based governance vote |

---

### 1.2.1 Reputation System Model

Reputation is a bounded score:

- Min Score: 0
- Max Score: 100

### Dynamics:
- Decreases on penalties
- Gradually recovers over time (decay model)
- Weighted in reward calculation

Example:
rewardMultiplier = reputation / 100

Low reputation reduces earning potential and governance influence.

---

## 1.3 Violation Classification Model

To ensure deterministic enforcement, violations are classified using measurable criteria:

- Minor Violation:
  - score < X
  - low-impact or accidental behavior

- Major Violation:
  - score ≥ X && < Y
  - high-impact or intentional manipulation

- Repeated Violation:
  - N violations within a defined time window (T)
  - triggers escalation regardless of individual severity

Parameters (configurable):
- X, Y → severity thresholds
- N → number of violations
- T → timeframe (e.g., 7 days)

This model ensures consistent and non-ambiguous penalty enforcement.

---

## 2. Reward Suspension

- Reward suspension halts token updates for a defined period.  
- Event logged: `RewardSuspended(participant, duration)`  
- Can be linked to milestone timing for automatic enforcement.

Reward suspension is triggered based on detection signals and confidence scoring.

It applies when participant behavior is flagged as medium-risk but not yet confirmed as malicious.

This mechanism acts as a preventive layer before escalating to slashing or permanent penalties.

---

## 2.1 Detection Layer & Anti-Manipulation

The system relies on a hybrid detection mechanism:

### On-Chain Signals
- Abnormal transaction frequency
- Repeated micro-transactions
- Suspicious allocation patterns

### Off-Chain Analysis (Optional)
- Behavioral analysis engines
- Machine learning anomaly detection
- Oracle-fed risk signals

### Anti-Sybil Protection
- Identity linkage (KYC / trust graph)
- Transaction clustering
- Rate-limiting per participant

Note: A violation is only triggered when detection confidence exceeds a defined threshold.

---

## 3. Slashing
- Slashing is **dynamic and recorded on-chain** for all levels of violations.  
- Example function: `slash(percent)`  
- Always check for **balance sufficiency** to prevent errors or underflows.

### Execution Guarantees

- All penalty operations must be atomic
- Fail-safe mechanisms prevent partial state updates
- Smart contracts must include reentrancy protection

This ensures consistency and prevents exploit scenarios.

---

## 4. Control & Governance
- Core functions are restricted to **owner or multi-sig**.  
- Event logging ensures transparency:  
```solidity
event AllocationReduced(address participant, uint256 amount);
event Slashed(address participant, uint256 percent);
event PermanentBan(address participant);
```
- Governance review should complement owner actions to reduce risk of abuse.

---

  ### Governance Trigger Conditions

   Governance review is required when:
  - Slashing exceeds a defined threshold (e.g., > 20%)
  - Permanent ban is proposed
  - Disputed penalties are flagged

  ### Voting Rules:
  
  - Minimum quorum required
  - Majority or supermajority decision
  - Time-bound voting window

This ensures decentralization and prevents abuse of authority.

---

## 5. Audit & Transparency
- Every action is recorded on-chain and can be queried via API:  
  - Suspended rewards  
  - Reduced allocation  
  - Slashed participants  
  - Permanent bans  
- Enables the community to monitor compliance and fairness.

  ## Appeal & Reversibility

Participants may request a governance review if:
- They believe a penalty was incorrectly applied

Possible outcomes:
- Penalty upheld
- Penalty reduced
- Full reversal

All appeals are recorded on-chain for transparency.

  ## Appeal & Reversibility

Participants may request a governance review if:
- They believe a penalty was incorrectly applied

Possible outcomes:
- Penalty upheld
- Penalty reduced
- Full reversal

All appeals are recorded on-chain for transparency.

---

## 6. Performance Considerations
- Frequent updates to `piBalance` can be costly on-chain.  
- Recommended strategies:  
  - Batch processing of multiple participants  
  - Off-chain computation where possible, submitting only final updates on-chain

---

## 7. Edge Case Handling
- Ensure safe behavior for:  
  - Zero balances  
  - Maximum slashing (100%)  
  - Reward suspension durations linked to milestones

---

## 8. Testing & Validation
- Include unit tests covering:  
  - All penalty types  
  - Slashing across different violation levels  
  - Simulation of random participant behavior  
- This ensures reliability, fairness, and auditability before mainnet deployment.

---

## 9. Additional Notes
- All mechanisms are **transaction-driven** and dynamic.  
- Testing must be conducted in a **local or test environment** before mainnet launch.  
- Integration with `BaseLinkedPiWithPenalties.sol` and the README ensures consistent documentation and developer guidance.

---

## 10. Penalty & Enforcement Flow (Detection-Driven Model)

```mermaid
flowchart TD
    A[Start: Participant Activity] --> B[Detection Layer Analysis]

    B --> C{Risk Level Based on Confidence}

    C -- Low Risk --> D[Continue Normal Rewards]

    C -- Medium Risk --> E[Apply Reward Suspension]
    E --> F[Monitor Behavior]

    F --> G{Behavior Improved?}
    G -- Yes --> D
    G -- No --> H[Escalate to Violation Classification]

    C -- High Risk --> H{Violation Classification}

    H -- Minor --> I[Apply Dynamic Penalty]
    H -- Major --> J[Apply Slashing]
    H -- Repeated --> K[Consider Permanent Ban]

    I --> L[Adjust Reputation]
    J --> L
    K --> L

    L --> M[Log Event On-Chain]

    M --> N{Governance Review Required?}

    N -- Yes --> O[Community / Trust-Based Vote]
    N -- No --> P[Owner / Multi-sig Action]

    O --> Q[Update Rewards & Allocation]
    P --> Q

    Q --> R[End: Participant Updated]
