# 08 — Security & threat model (PiRC smart contracts)

This chapter lists the main ways a PiRC launch can fail and what contract design choices prevent them.

---

## 1) PiRC-specific threats

### Threat A: commitment diversion (“proceeds to project”)

**Attack:** a function routes committed Pi to the project wallet.

**Prevention:**

- escrow contract has no transfer-to-project path;
- if admin exists, admin cannot override this invariant;
- only DEX `addLiquidity` can move committed Pi out of escrow.

---

### Threat B: liquidity rug (“withdraw initial LP”)

**Attack:** project withdraws or migrates initial liquidity.

**Prevention:**

- initial LP position is owned by a lock contract,
- lock contract cannot withdraw principal (or only governance can after extreme delay).

---

### Threat C: allocation manipulation after commitments

**Attack:** allocation parameters are changed after participants commit.

**Prevention:**

- participation close freezes \(C\) and the participant set;
- allocation finalization is one-time;
- if using offchain engagement tiers, finalize a merkle root onchain and prevent replacement.

---

### Threat D: surprise minting / supply expansion

**Attack:** extra tokens minted after launch, diluting participants.

**Prevention:**

- fixed supply token, or
- minting only via LaunchManager with a hard cap, and buckets enforced,
- vesting contracts for team/treasury.

---

## 2) Generic smart contract threats (still relevant)

- **Reentrancy**: protect token transfers and external calls (DEX/router) with checks-effects-interactions or reentrancy guards.
- **Access control mistakes**: ensure only project owner can deposit buckets; only allowed roles can change state.
- **Oracle manipulation**: if any price oracle is used (e.g., for alternative designs), treat it as adversarial.
- **MEV / sandwiching**: protect `addLiquidity` and key swaps with `minAmount` bounds and deadlines.
- **Integer rounding**: allocation math needs careful rounding rules (e.g., floor divisions) and “dust” handling.

---

## 3) Correctness invariants to assert/test

At minimum, test:

- **Conservation of commitments**: escrow Pi balance equals sum of \(c_i\) until seeding.
- **No commit after close**.
- **No seeding before close**.
- **Seeding only once**.
- **Claims bounded**: total claimed \(\le T_{purchase}+T_{engage}\).
- **Liquidity lock**: project cannot withdraw initial LP position.

---

## 4) Operational safety features (optional)

These features can reduce risk without breaking PiRC invariants:

- **Pause**: halts new commits or claims in emergencies.
- **Emergency cancel**: before seeding, refund commitments to users.
- **Time-delayed upgrades**: if using upgradeable contracts, require a public delay.

Be careful: emergency features must not allow “admin drains funds.”

