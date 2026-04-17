## 3. Participation Window (Stake → Max Tokens You Can Commit)
During a participation window, users stake Pi to receive PiPower. **All participants stake for the same fixed duration** (a standardized launch parameter,e.g. one month).

- PiPower for each participant determines the *maximum* number of tokens they can commit Pi to buy, given the total amount of tokens provided by the project to the Launchpad.

#### Baseline PiPower Rule for only the highest tier of the Long-Term Lockers
- Any user with an **active Pi lockup of ≥90% of their mined tokens for at least 3 years at the time of a token launch created before February 20, 2026** automatically receives a standardized, platform-defined baseline PiPower $PiPower_{Baseline}$. The time limit was to prevent future accounts created to exploit this baseline PiPower, and to acknowledge Long-Term Lockers with high percentages who may not have enough Pi unlocked to participate in the launchpad. The number for $PiPower_{Baseline}$ will be calibrated. 

### 3.1 PiPower Calculation
$$
PiPower_i = T_{available} \times (\frac{StakedPi_i}{\sum StakedPi} + PiPower_{Baseline})
$$
- Here, $StakedPi_i$ is the amount of Pi the user $i$ has staked for the launch of the token t.
- $T_{available}$ is the total tokens provided by the project for participants to acquire through the Launchpad. 
- PiPower is therefore proportional to a user’s fraction of total staked Pi in the network for accessing the token.

### 3.2 Engagement Tracking
- During this same participation window, participants' interactions with the project's app are scored (Engagement Score).
- At window close, participants are ranked highest-to-lowest based on the Engagement Score; this rank may have an effect on the effective price of the token in the Allocation Period.


### 3.3 Proposed Refinement: Weighted Engagement Framework (WEF)
To ensure the **Engagement Score** mentioned in Section 3.2 reflects true utility, I propose a **Weighted Engagement Framework**. 

As a Full-Stack developer, I suggest that the Engagement Score should be a composite of:
1. **Proof of Activity (PoA):** Basic interactions (Logins, navigation).
2. **Proof of Utility (PoU):** High-value actions (e.g., contributing data, completing transactions, or reaching app-specific milestones).
3. **Consistency Factor:** Rewarding users who engage throughout the entire window, rather than burst activity at the end.

**Technical Implementation:**
Projects should provide a `Manifest` of weighted actions to the Launchpad. This prevents "Engagement Farming" and ensures that the "Engagement-ranked order" truly rewards the most valuable users of the ecosystem.



Next: **4-Allocation [`Design 1`](<4-allocation/4-allocation design 1.md>) [`Design 2`](<4-allocation/4-allocation design 2.md>)**
