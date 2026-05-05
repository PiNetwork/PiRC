# 6 — Adaptive Proof of Contribution (APoC)

## Overview
Adaptive Proof of Contribution (APoC) is an AI-assisted reward allocation layer designed to complement the existing ecosystem token allocation models.

Instead of distributing tokens purely based on activity quantity, APoC evaluates **quality, authenticity, economic impact, and trustworthiness** of contributions.

Goal:
Transform token distribution from "activity mining" → "value mining".

---

## Problem Addressed

Traditional Web3 incentive models suffer from:

- Bot farming
- Sybil attacks
- Engagement spam
- Liquidity extraction behavior
- Short-term participation incentives

Even activity-based models can be gamed if quantity > quality.

APoC introduces a dynamic scoring layer to ensure:
> Tokens flow to contributors who create real economic value.

---

## Core Concept

Each participant receives a dynamic **Contribution Score (CS)**:

CS = Activity × Impact × Trust × NetworkEffect × Integrity

Reward emission is proportional to CS instead of raw activity.

---

## Contribution Score Components

### 1. Activity Score (A)
Measures measurable actions:
- Transactions
- Purchases
- Listings
- Development commits
- Service usage

Normalized logarithmically to prevent spam inflation.

---

### 2. Impact Score (I)
Measures economic usefulness:
- User retention caused
- Volume generated
- Repeat usage
- External adoption

---

### 3. Trust Score (T)
Derived from:
- Account age
- KYC confidence
- Historical behavior
- Dispute history
- Counterparty feedback

Non-transferable and slowly changing.

---

### 4. Network Effect Score (N)
Rewards users who bring valuable participants:
- Active referrals
- Builder ecosystems
- Marketplace creation

Not based on count — based on downstream contribution quality.

---

### 5. Integrity Score (G)
AI fraud detection output:
- Bot probability
- Sybil clustering detection
- Abnormal interaction patterns
- Velocity anomalies

If flagged → reward decay multiplier applies.

---

## Final Formula

RewardShare = CS_user / Σ(CS_all_users)

TokenReward = DailyEmission × RewardShare

---

## Emission Dampening
To prevent reward draining:

If ecosystem velocity spikes:
EmissionRate decreases

If ecosystem utility increases:
EmissionRate increases

---

## Anti-Manipulation Design

| Attack Type | Mitigation |
|-----------|------|
| Bot farms | Behavioral clustering AI |
| Sybil accounts | Graph identity analysis |
| Wash trading | Economic circularity detection |
| Spam actions | Log normalization |
| Referral abuse | Downstream contribution weighting |

---

## Architecture

Client Activity → App Server → AI Scoring Engine → Oracle → Smart Contract

AI does NOT distribute tokens.
AI only produces a signed Contribution Score.

Smart contract verifies signature and releases rewards trustlessly.

---

## Smart Contract Pseudocode

```solidity
struct Contribution {
    uint256 score;
    uint256 timestamp;
}

mapping(address => Contribution) public contributions;

function submitScore(
    address user,
    uint256 score,
    bytes calldata oracleSignature
) external {

    require(verifyOracle(user, score, oracleSignature), "Invalid oracle");

    contributions[user] = Contribution(score, block.timestamp);
}

function claimReward() external {

    uint256 reward = calculateReward(msg.sender);

    require(reward > 0, "No reward");

    token.mint(msg.sender, reward);
}
