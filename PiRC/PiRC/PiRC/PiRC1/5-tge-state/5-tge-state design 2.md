## 5 Official TGE/Market Opening
When the allocation rollout ends, the LP/market opens for unrestricted access. This event is the official token generation event (TGE).

#### LP situation
Initially, after **step 2** is completed, the Liquidity Pool contains **80% of the launch token allocation** and **50% of the committed Pi**, and 100% of the LP shares are held by the restricted **Escrow Wallet**.

After the **step 3** is completed, the liquidity pool will contain **40% of the launch token allocation** and **100% of the committed Pi**. 100% of *LP shares* are still held by the restricted **Escrow Wallet**, since there were only swap operations and no additional deposit/withdraw operations during this step.  

Because withdrawals from the Restricted Escrow Wallet are permanently disabled, we get to the following result.

**Result:**  
No project team can drain liquidity; every project launched on Pi Launchpad is supported by an immutable initial liquidity.

After TGE, users will of course be able to freely interact with the pool by swaping either the ecosystem token or Pi; and could potentially deposit more liquidity if they wish to receive fees from the swap operations of others. See below for an analysis of how swaps can affect the spot price of the token by the LP.

### Token analysis

Assuming no further token issuance after TGE, the spot price of the token as provided by the LP pool has no upper bound and the following lower bound, which is only theoretically possible if every single launchpad participant were to swap **all** of their tokens back into the pool.

Let $x$ be the LP’s Pi reserve and $y$ be the LP’s token reserve. Ignoring fees, the AMM is constant-product: $x \cdot y = k$.

At the moment of market opening (end of the controlled swaps), the LP reserve state is:
- $x_{TGE} = C$
- $y_{TGE} = 0.4T$
- therefore $k = x_{TGE}y_{TGE} = 0.4CT$

At TGE, participants collectively hold the remaining launch allocation outside the pool:

$$
T_{out} = T - 0.4T = 0.6T
$$

If (theoretical worst case) *all* of that $0.6T$ is eventually market-sold into the LP, then the pool’s token reserve becomes $y_{min} = 0.4T + 0.6T = T$, and by the invariant the Pi reserve becomes:

$$
x_{min} = \frac{k}{y_{min}} = \frac{0.4CT}{T} = 0.4C
$$

So the **lower bound** on the LP’s *spot price* (Pi per token) is:

$$
p_{floor} = \frac{x_{min}}{y_{min}} = \frac{0.4C}{T}
$$

Using the listing-price definition from the fixed-price portion, $p_{list} = \frac{C}{0.4T}$, we can rewrite this bound as:

$$
p_{floor} = 0.16\,p_{list}
$$

Intuitively: even to the extent of “everyone sells everything”, the pool cannot be drained because the Escrow Wallet that added the liqludiity initially is locked and cannot withdraw from the pool; the pool still retains $0.4C$ Pi and $T$ tokens, which prevents the price to drop further in this construct.
**Intuitively:** even to the extent of “everyone swaps every token of theirs back to the pool”, the pool cannot be drained because the Escrow Wallet that added the liqludiity initially is locked and cannot withdraw from the pool; the pool still retains nearly half of the entire initial participant commitment ($0.4C$ Pi) and all of the tokens in circulation ($T$ tokens), which mathematically prevents the price to drop further than 16% of $p_{list}$ in this construct.

