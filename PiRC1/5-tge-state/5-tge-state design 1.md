## 5 Official TGE/Market Opening
When the allocation rollout ends, the LP/market opens for unrestricted access. This event is the official token generation event (TGE).

#### LP situation
Under this (Section 4 of Design 1), the Escrow Wallet seeds the LP once using the **deposit** operation of the LP:

- LP at TGE contains **all committed Pi** $C$ and the project’s liquidity bucket $T_{liquidity}=T$.
- Consequently, at TGE, the LP contains over 48% of the project’s current circulating supply ($\frac{T}{2T+T_{engage}}\approx 48.7\%$). 
- The depositor of these tokens to the pool is the **Escrow Wallet**, which subsequently gets permanently locked so that it cannot withdraw the initial liquidity.

Because withdrawals from the Restricted Escrow Wallet are permanently disabled, we get to the following result.

**Result:**
No project team can drain liquidity; every project launched on Pi Launchpad is supported by an immutable initial liquidity.

After TGE, users will of course be able to freely interact with the pool by swaping either the ecosystem token or Pi; and could potentially deposit more liquidity if they wish to receive fees from the swap operations of others. See below for an analysis of how swaps can affect the spot price of the token by the LP.


### Token analysis

Assuming no further token issuance after TGE, the spot price of the token as provided by the LP pool has no upper bound and the following lower bound, which is only theoretically possible if every single launchpad participant were to swap **all** of their tokens back into the pool.

Let $x$ be the LP’s Pi reserve and $y$ be the LP’s token reserve. Ignoring fees, the AMM is constant-product: $x \cdot y = k$.

At the moment of market opening (end of allocation), the LP reserve state is:
- $x_{TGE} = C$
- $y_{TGE} = T_{liquidity} = T$
- therefore $k = x_{TGE}y_{TGE} = CT$

At TGE, participants collectively hold, outside the pool, the purchase portion plus the $T_{engage}$ portion:

$$
T_{out} = T_{purchase} + T_{engage} = T + T_{engage}
$$

If (theoretical worst case) *all* of that $T_{out}$ is eventually market-sold into the LP, then the pool’s token reserve becomes $y_{min} = T + T_{out} = 2T + T_{engage}$, and by the invariant the Pi reserve becomes:

$$
x_{min} = \frac{k}{y_{min}} = \frac{CT}{2T + T_{engage}}
$$

So the **lower bound** on the LP’s *spot price* (Pi per token) is:

$$
p_{floor} = \frac{x_{min}}{y_{min}} = \frac{CT}{(2T + T_{engage})^2}
$$

Using this design’s listing price definition, $p_{list}=\frac{C}{T}$, we can rewrite this bound as:

$$
p_{floor}=\left(\frac{T}{2T+T_{engage}}\right)^2 p_{list}=\frac{p_{list}}{\left(2+\frac{T_{engage}}{T}\right)^2}
$$

In the base case with no rewards ($T_{engage}=0$), this gives $p_{floor}=0.25\,p_{list}$. With the rewards parameter from Section 4 ($T_{engage}=5\%T$), the **lower bound on the LP’s *spot price* (Pi per token) is $p_{floor}\approx 0.238\,p_{list}$**. There is no higher bound.

**Intuitively:** even to the extent of “everyone swaps every token of theirs back to the pool”, the pool cannot be drained because the Escrow Wallet that added the liqludiity initially is locked and cannot withdraw from the pool; the pool still retains nearly half of the entire initial participant commitment ($0.488C$ Pi) and all of the tokens in circulation ($2.05T$ tokens), which mathematically prevents the price to drop further than 23.8% of $p_{list}$ in this construct.

Next: [`Design 2`](<../4-allocation/4-allocation design 2.md>)

---

## 📍 PiRC1 Feedback – Section 5: Official TGE / Market Opening

The TGE and market openings of both LaunchPad and my MapCap use case are similar in most respects, with the following key differences:

> - **MapCap LP / Market Opening:**  
>   - The LP/market opens for **unrestricted public access immediately after TGE**.  
>   - Any Pioneer with a **mainnet wallet**, including LaunchPad participants, can buy MapCap tokens at **LP spot-price** and sell them.  
>   - Tokens purchased during LaunchPad phase can only be **sold after vesting** (10% released at the end of each month after TGE).  
>   - All tokens sold via MapCap LP, regardless of purchase timing, are **market sales** at the LP spot price at the time of sale.
>
> - **Governance Participation:**  
>   - All token holders can participate in **app governance decisions** (e.g., feature prioritization, dividend amounts/frequency, engagement reward formulae).  
>   - Governance participation occurs via **surveys, demos/reviews, and voting**.
>
> - **Post-TGE Rewards:**  
>   - Ongoing rewards continue **forever after TGE** until app dissolution.  
>   - Functionally similar to **dividends**: MapCap token holders receive **Pi payments** directly in their wallets.  
>   - Frequency and amount of payouts are determined by **app governance**, based on revenue/profitability.  
>   - Payouts are **proportional to token holdings**, optionally adjusted by **utility engagement value**.
>
> - **Engagement Incentive Continuation:**  
>   - Utility engagement at payout is calculated using the **LaunchPad engagement algorithm**.  
>   - Higher engagement → higher reward.  
>   - Dividend engagement algorithm can only be changed via **token-holder-approved governance**.
>
> - **No Hard Price Floor (P(floor))**:  
>   - In MapCap, LP can go as low as **zero Pi** if all tokens are sold back.  
>   - Developers may intervene **optionally**, via governance, to restore Pi liquidity and token value.  
>   - This allows **market-driven confidence** while keeping P(floor) flexible.
>
> - **End-of-Life / Dissolution Handling:**  
>   - Token spot price can reduce to zero if the app ceases to exist.  
>   - To prevent unfairness, MapCap includes an **LP exit process** before dissolution news:  
>     - LP trading is suspended.  
>     - A **single exit spot price (P(exit))** is calculated from remaining Pi vs total token holdings.  
>     - During a **4-week exit period**, all token holders may swap tokens at **P(exit)**, ensuring fairness.  
>     - After the exit period, remaining tokens can still be redeemed, but are essentially worthless.
