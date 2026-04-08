TITLE: Cryptographically Verifiable Utility-Weighted Allocation Model
STATUS: Private Research Draft (Final ASCII Version)

---------------------------------------
SECTION 0 - CONSTANTS
---------------------------------------

S = 1000000   // fixed point precision

All rational values are represented as integers scaled by S.

---------------------------------------
SECTION 1 - ENGAGEMENT MODEL
---------------------------------------

For each user u and epoch E:

e_i in [0,1]

Weights:
w_i in [0,0.4]

Constraints:
sum(w_i) = 1
n >= 3

Weighted Engagement:

W(u,E) = sum( w_i * e_i )

Integer form:

W_int = floor( S * W )

0 <= W_int <= S

---------------------------------------
SECTION 2 - TIME DECAY
---------------------------------------

delta_t = current_epoch - last_active_epoch

e_int = max(0, S - (delta_t * S / T_max))

No floating math used.

---------------------------------------
SECTION 3 - SMOOTHING FUNCTION
---------------------------------------

If W_int <= S/2:

    S_int = (2 * W_int * W_int) / S

Else:

    diff = S - W_int
    S_int = S - (2 * diff * diff) / S

---------------------------------------
SECTION 4 - FINAL ALLOCATION
---------------------------------------

A_int = p_floor_int
        + ((S - p_floor_int) * S_int) / S

0 <= A_int <= S

---------------------------------------
SECTION 5 - SIGNATURE COMMITMENT
---------------------------------------

message = encode(user || epoch || W_int || A_int)

hash = SHA256(message)

Option A - HMAC:
signature = HMAC(key, hash)

Option B - Asymmetric:
signature = Sign(private_key, hash)

---------------------------------------
SECTION 6 - MERKLE AGGREGATION
---------------------------------------

leaf = SHA256(user || W_int || A_int)

Merkle root per epoch published.

User proves inclusion with Merkle proof.

---------------------------------------
SECTION 7 - ZK VARIANT (COMMITMENT MODEL)
---------------------------------------

Pedersen commitment per component:

C_i = g^e_i * h^r_i

Weighted commitment:

C_W = product( C_i ^ w_i )

Prove in zero knowledge:
- e_i in range [0,1]
- weighted sum equals W

Verifier checks proof without revealing e_i.

---------------------------------------
SECTION 8 - ON-CHAIN VERIFICATION (PSEUDOCODE)
---------------------------------------

function verify(user, epoch, W_int, A_int):

    require(W_int <= S)

    if W_int <= S/2:
        S_int = (2 * W_int * W_int) / S
    else:
        diff = S - W_int
        S_int = S - (2 * diff * diff) / S

    computedA =
        p_floor_int
        + ((S - p_floor_int) * S_int) / S

    require(computedA == A_int)

    verify_merkle_proof(...)
    verify_signature(...)

    return true

---------------------------------------
SECTION 9 - MONOTONICITY PROOF (SKETCH)
---------------------------------------

For W <= 0.5:
    derivative S'(W) = 4W > 0

For W > 0.5:
    derivative S'(W) = 4(1 - W) > 0

Therefore S(W) strictly increasing.

Since:
A(W) = p_floor + (1 - p_floor) * S(W)

And (1 - p_floor) > 0

A(W) is strictly increasing.

---------------------------------------
SECTION 10 - GAME THEORY MODEL
---------------------------------------

User payoff:

Pi(u) = Allocation(u) - Cost(e)

Assume convex cost:

Cost(e) = k * sum( e_i^2 )

Equilibrium condition:

dA/de_i = dCost/de_i

Since:
- weights bounded (<= 0.4)
- smoothing bounded
- gradient bounded

No incentive for extreme single-metric inflation.

Interior equilibrium exists.

---------------------------------------
END OF FILE
---------------------------------------

---------------------------------------
SECTION 11 - SECURITY MODEL
---------------------------------------

We assume the following threat model:

Adversary capabilities:

1. Users may attempt to manipulate engagement metrics.
2. Users may attempt to coordinate activity bursts.
3. Backend operator may be partially trusted.
4. Network observers can access public data.

Security goals:

G1 - Allocation integrity  
G2 - Public verifiability  
G3 - Manipulation resistance  
G4 - Deterministic reproducibility

Assumptions:

A1: SHA256 is collision resistant.
A2: Signature scheme is EUF-CMA secure.
A3: Merkle tree construction is correct.
A4: Epoch progression is strictly monotonic.

Under these assumptions:

The allocation result A(u,E) cannot be modified
without breaking either:

• signature verification
• Merkle inclusion
• deterministic recomputation

---------------------------------------
SECTION 12 - ADVERSARIAL STRATEGIES
---------------------------------------

Attack 1 — Engagement Burst

Adversary rapidly increases e_i in a single epoch.

Defense:

Time decay and gradient bound enforce:

| W(E) - W(E-1) | <= delta_max

Therefore burst impact limited.

------------------------------------------------

Attack 2 — Metric Concentration

User concentrates activity in one metric.

Defense:

Weight cap:

w_i <= 0.4

Prevents dominance of a single engagement dimension.

------------------------------------------------

Attack 3 — Backend Manipulation

Backend attempts to alter allocation values.

Defense:

User verifies:

1. signature validity
2. Merkle inclusion proof
3. deterministic recomputation

Forgery requires breaking signature security.

------------------------------------------------

Attack 4 — Replay Attack

Adversary reuses allocation proof.

Defense:

Epoch binding inside message:

message = encode(user || epoch || W_int || A_int)

Proof invalid for different epochs.

---------------------------------------
SECTION 13 - COMPUTATIONAL COMPLEXITY
---------------------------------------

Per-user computation:

Weighted engagement:     O(n)
Smoothing function:      O(1)
Allocation computation:  O(1)

Merkle tree construction:

O(N)

Merkle verification:

O(log N)

Where N = number of users per epoch.

All operations use integer arithmetic.

No floating point operations required.

Suitable for deterministic smart contracts.

---------------------------------------
SECTION 14 - SIMULATION FRAMEWORK
---------------------------------------
import random

S = 1_000_000

def smoothing(W):
    if W <= S/2:
        return (2 * W * W) // S
    else:
        diff = S - W
        return S - (2 * diff * diff) // S

def allocation(W, p_floor):
    S_int = smoothing(W)
    return p_floor + ((S - p_floor) * S_int) // S

def simulate_users(num_users=10000):

    allocations = []

    for _ in range(num_users):

        e = [random.random() for _ in range(3)]

        w = [0.4, 0.3, 0.3]

        W = sum(e[i]*w[i] for i in range(3))

        W_int = int(W*S)

        A = allocation(W_int, int(0.1*S))

        allocations.append(A)

    return allocations

if __name__ == "__main__":

    results = simulate_users()

    print("Users simulated:", len(results))
    print("Average allocation:", sum(results)/len(results))

    ---------------------------------------
SECTION 15 - FUTURE EXTENSIONS
---------------------------------------

Possible extensions:

1. Zero-knowledge engagement proofs
2. zk-SNARK verification for allocation
3. on-chain allocation verification
4. multi-epoch smoothing
5. governance controlled weight updates

