# 10 — Reference contract skeletons (pseudocode)

These are **intentionally simplified** skeletons to show the relationship between PiRC concepts and contract boundaries. They are not chain-specific and are not production-ready without audits.

---

## A) LaunchManager (state + configuration)

```text
contract LaunchManager {
  struct Launch {
    address projectOwner;
    address token;           // launched token
    address escrow;          // per-launch escrow
    bytes32 poolId;          // DEX pool identifier
    State state;
    uint64 start;
    uint64 end;

    uint256 T_purchase;
    uint256 T_liquidity;
    uint256 T_engage;
  }

  function createLaunch(params) returns (launchId) { ... }
  function openParticipation(launchId) { ... }
  function closeParticipation(launchId) { ... }
  function finalizeAllocation(launchId, bytes32 rootOrParamsHash) { ... }
}
```

---

## B) Escrow (commitments + seeding + claims)

```text
contract Escrow {
  address launchManager;
  address token;
  address dexRouter;
  address liquidityLock;

  uint256 totalCommittedC;      // C
  mapping(address => uint256) committed; // c_i (or use events + merkle)

  bool participationOpen;
  bool participationClosed;
  bool seeded;

  function commit(uint256 piAmount) {
    require(participationOpen);
    require(!participationClosed);
    // transfer Pi from user to escrow
    committed[msg.sender] += piAmount;
    totalCommittedC += piAmount;
    emit Committed(msg.sender, piAmount);
  }

  function seedLiquidity(uint256 T_liquidity) {
    require(participationClosed);
    require(!seeded);
    // require escrow holds totalCommittedC Pi
    // require escrow holds T_liquidity tokens (sent by project)
    // addLiquidity(totalCommittedC, T_liquidity) -> lpPosition
    // lock lpPosition in LiquidityLock
    seeded = true;
    emit LiquiditySeeded(totalCommittedC, T_liquidity);
  }

  function claim(bytes proofOrParams) {
    require(seeded);
    // compute tBase = committed[msg.sender] * T_purchase / totalCommittedC
    // plus optional tEngage proven by merkle proof
    // transfer tokens to user
    emit Claimed(msg.sender, amount);
  }
}
```

PiRC-critical constraint: there is **no** function that transfers `totalCommittedC` Pi to the project.

---

## C) LiquidityLock (prevent rug)

```text
contract LiquidityLock {
  // store LP token / position receipt
  function lock(lpPosition) { ... }

  // Option 1 (strongest): no withdraw function at all.
  // Option 2: withdrawFeesOnly() to treasury, but never principal.
}
```

---

## D) Vesting (team / treasury)

```text
contract Vesting {
  struct Grant {
    address beneficiary;
    uint256 total;
    uint64 start;
    uint64 end;
    uint256 claimed;
  }

  function vested(Grant g, uint64 t) returns (uint256) {
    if (t <= g.start) return 0;
    if (t >= g.end) return g.total;
    return g.total * (t - g.start) / (g.end - g.start);
  }

  function claim(grantId) {
    uint256 v = vested(grant, now);
    uint256 owed = v - grant.claimed;
    grant.claimed += owed;
    // transfer owed tokens
  }
}
```

