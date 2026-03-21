# 🌐 Ecosystem Rewards Diagram

This diagram demonstrates how rewards are distributed across the ecosystem:

- **Active participants** receive incentive tokens or profits.  
- **New projects** are funded through part of the developer allocation.  
- **Security and verification efforts** are rewarded from the reserve.

> **Visual representation:** A network diagram connecting participants, projects, and reward streams.

```mermaid
flowchart TD
    A[Total Ecosystem Rewards] --> B[Active Participants]
    A --> C[Developer Allocation]
    A --> D[Reserve for Security & Verification]

    B --> B1[Incentive Tokens / Profit Share]
    C --> C1[Funding for New Projects]
    C --> C2[Milestone-Based Developer Rewards]
    D --> D1[Security Efforts Rewards]
    D --> D2[Verification Incentives]

    %% Darker colors for better text visibility
    style A fill:#d17adf,stroke:#333,stroke-width:2px,color:#000
    style B fill:#6fa3ff,stroke:#333,stroke-width:1px,color:#000
    style C fill:#4ca64c,stroke:#333,stroke-width:1px,color:#000
    style D fill:#ffb24c,stroke:#333,stroke-width:1px,color:#000

    %% Optional: rounded corners
    classDef nodeStyle rx:5,ry:5;
    class A,B,C,D,B1,C1,C2,D1,D2 nodeStyle;;
```

**Legend:**  
- **Purple →** Total ecosystem rewards  
- **Blue →** Active participant incentives  
- **Green →** Developer allocations  
- **Orange →** Reserve for security & verification
