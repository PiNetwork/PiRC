/**
 * PiRC1 / 4-allocation — Database Layer (MQL / MongoDB Query Language)
 * ---------------------------------------------------------------------------
 * Full-language MongoDB implementation of the Allocation Period model
 * described in:
 *   - "4-allocation design 1.md"  (single-clearing-price deposit + engagement discount)
 *   - "4-allocation design 2.md"  (fixed-price portion + LP formation + engagement-gated swaps)
 *
 * Run with:  mongosh "mongodb://<host>/pirc_allocation" allocation-state.mql.js
 *
 * Chain scope (default per project convention): Pi Network (Stellar/Soroban)
 * primary; schema is chain-agnostic (see `chain` field on escrow_wallet).
 * Feeds into 5-tge-state via launch_id / escrow wallet_id.
 * ---------------------------------------------------------------------------
 */

const dbName = "pirc_allocation";
db = db.getSiblingDB(dbName);

// ---------------------------------------------------------------------------
// 1. COLLECTIONS + SCHEMA VALIDATION
// ---------------------------------------------------------------------------

db.createCollection("launch_config", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["launch_id", "project_name", "design_variant", "committed_pi"],
      properties: {
        launch_id:        { bsonType: "string", description: "PK, e.g. 'PIRC-0001'" },
        project_name:     { bsonType: "string" },
        design_variant:   { enum: ["design_1", "design_2"] },
        chain:            { bsonType: "string", description: "e.g. 'pi-network-soroban'" },
        committed_pi:     { bsonType: "double", description: "C — total Pi committed" },
        // design_1 fields
        t_purchase:       { bsonType: ["double", "null"], description: "design_1: T_purchase" },
        t_liquidity:      { bsonType: ["double", "null"], description: "design_1: T_liquidity" },
        t_engage:         { bsonType: ["double", "null"], description: "design_1: T_engage = 5% of T" },
        // design_2 fields
        t_total:          { bsonType: ["double", "null"], description: "design_2: T — full launch allocation" },
        created_at:       { bsonType: "date" }
      }
    }
  }
});

db.createCollection("participant", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["participant_id", "launch_id", "committed_pi", "engagement_score"],
      properties: {
        participant_id:    { bsonType: "string" },
        launch_id:          { bsonType: "string" },
        committed_pi:       { bsonType: "double", description: "c_i" },
        engagement_score:   { bsonType: "double" },
        engagement_rank:    { bsonType: "int", description: "1 = most engaged" },
        engagement_tier:    { enum: ["top", "mid", "bottom", null], description: "design_1 tier bucket" }
      }
    }
  }
});

db.createCollection("allocation_result", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["participant_id", "launch_id", "base_tokens"],
      properties: {
        participant_id:   { bsonType: "string" },
        launch_id:         { bsonType: "string" },
        base_tokens:       { bsonType: "double", description: "t_i^base = c_i / p_list" },
        engagement_tokens: { bsonType: ["double", "null"], description: "design_1: t_i^engage" },
        effective_price:   { bsonType: ["double", "null"], description: "p_eff,i (Pi per token)" },
        lockup_days:       { bsonType: ["int", "null"], description: "design_2: lockup on discounted portion" }
      }
    }
  }
});

db.createCollection("escrow_wallet", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["wallet_id", "launch_id", "address", "chain"],
      properties: {
        wallet_id:           { bsonType: "string" },
        launch_id:            { bsonType: "string" },
        address:              { bsonType: "string" },
        chain:                { bsonType: "string" },
        pi_deposited:         { bsonType: "double" },
        tokens_deposited:     { bsonType: "double" },
        permanently_locked:   { bsonType: "bool" },
        locked_at:            { bsonType: ["date", "null"] }
      }
    }
  }
});

db.createCollection("swap_execution", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["swap_id", "launch_id", "participant_id", "cumulative_s", "tokens_received"],
      properties: {
        swap_id:             { bsonType: "string" },
        launch_id:            { bsonType: "string" },
        participant_id:       { bsonType: "string" },
        engagement_rank:      { bsonType: "int" },
        cumulative_s:         { bsonType: "double", description: "s — cumulative ranked Pi swapped so far (design_2)" },
        pi_swapped:           { bsonType: "double" },
        tokens_received:      { bsonType: "double" },
        swap_price:           { bsonType: "double", description: "p_swap(s), Pi per token" },
        effective_price:      { bsonType: "double", description: "p_eff(s), harmonic mean of p_list and p_swap(s)" },
        lockup_days:          { bsonType: "int" }
      }
    }
  }
});

// Indexes
db.launch_config.createIndex({ launch_id: 1 }, { unique: true });
db.participant.createIndex({ participant_id: 1 }, { unique: true });
db.participant.createIndex({ launch_id: 1, engagement_rank: 1 });
db.allocation_result.createIndex({ participant_id: 1 }, { unique: true });
db.escrow_wallet.createIndex({ wallet_id: 1 }, { unique: true });
db.swap_execution.createIndex({ launch_id: 1, engagement_rank: 1 });

// ---------------------------------------------------------------------------
// 2. SEED DATA — one demo launch per design, small participant sets so the
//    aggregation results below can be hand-verified against the design docs.
// ---------------------------------------------------------------------------

db.launch_config.insertMany([
  {
    launch_id: "PIRC-D1-ALLOC-0001",
    project_name: "PiRC Demo Launch (Design 1)",
    design_variant: "design_1",
    chain: "pi-network-soroban",
    committed_pi: 300000.0,               // C
    t_purchase: 300000.0,                  // T
    t_liquidity: 300000.0,                 // T
    t_engage: 15000.0,                     // 5% of T
    t_total: null,
    created_at: new Date("2026-01-05T00:00:00Z")
  },
  {
    launch_id: "PIRC-D2-ALLOC-0001",
    project_name: "PiRC Demo Launch (Design 2)",
    design_variant: "design_2",
    chain: "pi-network-soroban",
    committed_pi: 1000000.0,               // C
    t_purchase: null,
    t_liquidity: null,
    t_engage: null,
    t_total: 1000000.0,                    // T
    created_at: new Date("2026-01-10T00:00:00Z")
  }
]);

// Design 1: three participants, one per tier, commitments equal within tier
// for simplicity — matches the "uniform commitments" illustration in the doc.
db.participant.insertMany([
  { participant_id: "P-D1-TOP",  launch_id: "PIRC-D1-ALLOC-0001", committed_pi: 100000.0, engagement_score: 95.0, engagement_rank: 1, engagement_tier: "top" },
  { participant_id: "P-D1-MID",  launch_id: "PIRC-D1-ALLOC-0001", committed_pi: 100000.0, engagement_score: 55.0, engagement_rank: 2, engagement_tier: "mid" },
  { participant_id: "P-D1-LOW",  launch_id: "PIRC-D1-ALLOC-0001", committed_pi: 100000.0, engagement_score: 10.0, engagement_rank: 3, engagement_tier: "bottom" }
]);

db.escrow_wallet.insertOne({
  wallet_id: "ESCROW-D1-ALLOC-0001",
  launch_id: "PIRC-D1-ALLOC-0001",
  address: "CESCROWD1ALLOCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  chain: "pi-network-soroban",
  pi_deposited: 300000.0,     // C
  tokens_deposited: 300000.0, // T_liquidity
  permanently_locked: true,
  locked_at: new Date("2026-01-06T00:00:00Z")
});

// Design 2: five participants ranked by engagement, evenly spaced across
// the s in [0, C/2] range to reproduce the doc's illustrative curve.
db.participant.insertMany([
  { participant_id: "P-D2-R1", launch_id: "PIRC-D2-ALLOC-0001", committed_pi: 100000.0, engagement_score: 99.0, engagement_rank: 1, engagement_tier: null },
  { participant_id: "P-D2-R2", launch_id: "PIRC-D2-ALLOC-0001", committed_pi: 100000.0, engagement_score: 80.0, engagement_rank: 2, engagement_tier: null },
  { participant_id: "P-D2-R3", launch_id: "PIRC-D2-ALLOC-0001", committed_pi: 100000.0, engagement_score: 60.0, engagement_rank: 3, engagement_tier: null },
  { participant_id: "P-D2-R4", launch_id: "PIRC-D2-ALLOC-0001", committed_pi: 100000.0, engagement_score: 40.0, engagement_rank: 4, engagement_tier: null },
  { participant_id: "P-D2-R5", launch_id: "PIRC-D2-ALLOC-0001", committed_pi: 100000.0, engagement_score: 20.0, engagement_rank: 5, engagement_tier: null }
]);

db.escrow_wallet.insertOne({
  wallet_id: "ESCROW-D2-ALLOC-0001",
  launch_id: "PIRC-D2-ALLOC-0001",
  address: "CESCROWD2ALLOCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  chain: "pi-network-soroban",
  pi_deposited: 500000.0,     // C/2, Step 2
  tokens_deposited: 800000.0, // 0.8T, Step 2
  permanently_locked: true,
  locked_at: new Date("2026-01-11T00:00:00Z")
});

// ---------------------------------------------------------------------------
// 3. QUERIES / AGGREGATION PIPELINES (full MQL: $lookup, $group, $addFields)
// ---------------------------------------------------------------------------

/**
 * 3.1 Design 1 — computes base tokens, engagement bonus, and effective price
 * per participant, joined against launch_config for C/T/T_engage.
 */
function computeDesign1Allocation(launchId) {
  return db.participant.aggregate([
    { $match: { launch_id: launchId } },
    {
      $lookup: {
        from: "launch_config",
        localField: "launch_id",
        foreignField: "launch_id",
        as: "config"
      }
    },
    { $unwind: "$config" },
    {
      $addFields: {
        p_list: { $divide: ["$config.committed_pi", "$config.t_purchase"] },
        t_i_base: { $divide: ["$committed_pi", { $divide: ["$config.committed_pi", "$config.t_purchase"] }] }
      }
    },
    {
      $group: {
        _id: { launch_id: "$launch_id", tier: "$engagement_tier" },
        tier_committed_pi: { $sum: "$committed_pi" },
        docs: { $push: "$$ROOT" }
      }
    },
    { $unwind: "$docs" },
    {
      $addFields: {
        "docs.tier_share": {
          $cond: [
            { $eq: ["$_id.tier", "top"] }, 2.0 / 3.0,
            { $cond: [{ $eq: ["$_id.tier", "mid"] }, 1.0 / 3.0, 0.0] }
          ]
        }
      }
    },
    {
      $addFields: {
        "docs.t_i_engage": {
          $cond: [
            { $eq: ["$tier_committed_pi", 0] }, 0.0,
            {
              $multiply: [
                "$docs.tier_share",
                "$docs.config.t_engage",
                { $divide: ["$docs.committed_pi", "$tier_committed_pi"] }
              ]
            }
          ]
        }
      }
    },
    {
      $addFields: {
        "docs.p_eff": {
          $divide: ["$docs.committed_pi", { $add: ["$docs.t_i_base", "$docs.t_i_engage"] }]
        }
      }
    },
    {
      $project: {
        _id: 0,
        participant_id: "$docs.participant_id",
        tier: "$_id.tier",
        t_i_base: "$docs.t_i_base",
        t_i_engage: "$docs.t_i_engage",
        p_list: "$docs.p_list",
        p_eff: "$docs.p_eff",
        p_eff_over_p_list: { $divide: ["$docs.p_eff", "$docs.p_list"] }
      }
    },
    { $sort: { p_eff_over_p_list: 1 } }
  ]).toArray();
}

/**
 * 3.2 Design 2 — reconstructs the ranked-swap curve p_swap(s)/p_list and the
 * per-participant effective price p_eff(s), matching the closed-form formulas
 * in Section 4.1.1 of the design doc.
 */
function computeDesign2SwapCurve(launchId) {
  return db.participant.aggregate([
    { $match: { launch_id: launchId } },
    { $sort: { engagement_rank: 1 } },
    {
      $lookup: {
        from: "launch_config",
        localField: "launch_id",
        foreignField: "launch_id",
        as: "config"
      }
    },
    { $unwind: "$config" },
    {
      $group: {
        _id: "$launch_id",
        C: { $first: "$config.committed_pi" },
        T: { $first: "$config.t_total" },
        participants: { $push: "$$ROOT" }
      }
    },
    {
      $addFields: {
        p_list: { $divide: ["$C", { $multiply: [0.4, "$T"] }] },
        half_C: { $divide: ["$C", 2] },
        n: { $size: "$participants" }
      }
    },
    { $unwind: { path: "$participants", includeArrayIndex: "idx" } },
    {
      $addFields: {
        // Evenly space cumulative swap position s across [0, C/2] by rank.
        "s": {
          $multiply: [
            "$half_C",
            { $cond: [{ $gt: ["$n", 1] }, { $divide: ["$idx", { $subtract: ["$n", 1] }] }, 0] }
          ]
        }
      }
    },
    {
      $addFields: {
        p_swap_over_p_list: {
          $pow: [
            { $add: [0.5, { $divide: ["$s", "$C"] }] },
            2
          ]
        }
      }
    },
    {
      $addFields: {
        p_swap: { $multiply: ["$p_swap_over_p_list", "$p_list"] }
      }
    },
    {
      $addFields: {
        p_eff: {
          $divide: [
            { $multiply: [2, "$p_list", "$p_swap"] },
            { $add: ["$p_list", "$p_swap"] }
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        participant_id: "$participants.participant_id",
        engagement_rank: "$participants.engagement_rank",
        s: 1,
        p_swap_over_p_list: { $round: ["$p_swap_over_p_list", 3] },
        p_eff_over_p_list: { $round: [{ $divide: ["$p_eff", "$p_list"] }, 3] }
      }
    },
    { $sort: { engagement_rank: 1 } }
  ]).toArray();
}

/**
 * 3.3 Confirms every escrow wallet backing a live allocation is permanently
 *     locked (the "no team can drain liquidity" invariant, shared with 5-tge-state).
 */
function unlockedEscrowAudit() {
  return db.escrow_wallet.find({ permanently_locked: { $ne: true } }).toArray();
}

// Demo run (comment out in production import scripts):
printjson({
  design1_allocation: computeDesign1Allocation("PIRC-D1-ALLOC-0001"),
  design2_swap_curve: computeDesign2SwapCurve("PIRC-D2-ALLOC-0001"),
  unlocked_escrow_wallets: unlockedEscrowAudit() // should be [] — invariant holds
});
