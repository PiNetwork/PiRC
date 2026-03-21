# Governance & Voting – Pi Hybrid Token

## Overview
This document defines how participants can **propose, vote, and review actions** within the Pi Hybrid Token ecosystem.  
It covers:
- Proposal submission  
- Voting periods & thresholds  
- Emergency overrides  
- Integration with security penalties  

---

## 1. Proposal Submission
- Any participant with **minimum reputation score** can submit a proposal.  
- Proposal structure example:
```text
ProposalID: unique id
Proposer: address
Type: [Penalty | Allocation | Feature | Governance]
Details: description + data
SubmissionTime: timestamp
```
---

## 2. Voting Rules
- Voting period: X blocks / Y days  
- Minimum quorum: Z% of active participants  
- Majority threshold: ≥ 50% votes to pass (higher thresholds for sensitive proposals)  
- Vote options: Yes / No / Abstain  

---

## 3. Emergency & Overrides
- Owner / Multi-sig can temporarily override votes in emergencies.  
- All emergency actions must be logged on-chain and justified.  
- Reviewed in next community vote.  

---

## 4. Integration With Penalties
Any governance decision affecting:  

- Allocation  
- Reputation  
- Slashing / bans  

Must be recorded on-chain.  

Example events:
```solidity
event ProposalSubmitted(uint256 id, address proposer);
event VoteCast(uint256 id, address voter, bool vote);
event ProposalExecuted(uint256 id, bool success);
```
---

Example events:

```solidity
event ProposalSubmitted(uint256 id, address proposer);
event VoteCast(uint256 id, address voter, bool vote);
event ProposalExecuted(uint256 id, bool success);
```

---

## 5. Audit & Transparency

All proposals, votes, and results are publicly queryable via API or smart contract events.  
Ensures fairness and prevents manipulation.

### Proposal Flow (Mermaid Diagram)

```mermaid
flowchart TD
    A[Start: Proposal Submission] --> B{Eligibility Check?}
    B -- Not Eligible --> C[Reject Proposal]
    B -- Eligible --> D[Open Voting Period]
    
    D --> E{Quorum Met?}
    E -- No --> F[Proposal Fails]
    E -- Yes --> G{Vote Threshold Met?}
    
    G -- No --> F
    G -- Yes --> H{Emergency Override?}
    
    H -- Yes --> I[Owner/Multi-sig Action Logged]
    H -- No --> J[Execute Proposal On-Chain]
    
    I --> J
    J --> K[Update System / Allocation / Reputation]
    K --> L[End: Proposal Resolved]
