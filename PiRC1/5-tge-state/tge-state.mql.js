/**
 * PiRC1 / 5-tge-state — Database Layer (MQL / MongoDB Query Language)
 * ---------------------------------------------------------------------------
 * Full-language MongoDB implementation of the TGE (Token Generation Event)
 * state model described in:
 *   - "5-tge-state design 1.md"  (single-shot escrow deposit)
 *   - "5-tge-state design 2.md"  (phased step-2 / step-3 deposit)
 *
 * Run with:  mongosh "mongodb://<host>/pirc_tge" tge-state.mql.js
 *
 * Chain scope (default per project convention): Pi Network (Stellar/Soroban)
 * primary; schema is chain-agnostic so Solana/Ethereum launches can reuse it
 * (see `chain` field on escrow_wallet / swap_event).
 * ---------------------------------------------------------------------------
 */

const dbName = "pirc_tge";
db = db.getSiblingDB(dbName);

// ---------------------------------------------------------------------------
// 1. COLLECTIONS + SCHEMA VALIDATION
// ---------------------------------------------------------------------------

db.createCollection("launch_config", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["launch_id", "project_name", "design_variant", "committed_pi", "launch_token_allocation"],
      properties: {
        launch_id:               { bsonType: "string", description: "PK, e.g. 'PIRC-0001'" },
        project_name:            { bsonType: "string" },
        design_variant:          { enum: ["design_1", "design_2"], description: "TGE design used (single-shot vs phased)" },
        chain:                   { bsonType: "string", description: "e.g. 'pi-network-soroban', 'solana', 'ethereum'" },
        committed_pi:            { bsonType: "double", description: "C — total Pi committed by launchpad participants" },
        launch_token_allocation: { bsonType: "double", description: "T — project liquidity / launch token bucket" },
        engagement_allocation:   { bsonType: ["double", "null"], description: "T_engage — design_1 only, rewards bucket" },
        created_at:              { bsonType: "date" }
      }
    }
  }
});

db.createCollection("escrow_wallet", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["wallet_id", "launch_id", "address", "chain", "permanently_locked"],
      properties: {
        wallet_id:            { bsonType: "string" },
        launch_id:            { bsonType: "string" },
        address:              { bsonType: "string", description: "Soroban contract / SPL / EVM address" },
        chain:                { bsonType: "string" },
        lp_shares_pct:        { bsonType: "double", description: "% of total LP shares held (should be 100.0 pre-TGE)" },
        permanently_locked:   { bsonType: "bool", description: "true => withdraw() permanently disabled" },
        locked_at:            { bsonType: ["date", "null"] }
      }
    }
  }
});

db.createCollection("lp_state_snapshot", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["snapshot_id", "launch_id", "step_label", "pi_reserve", "token_reserve"],
      properties: {
        snapshot_id:    { bsonType: "string" },
        launch_id:      { bsonType: "string" },
        step_label:     { enum: ["step_2", "step_3", "tge"], description: "Rollout checkpoint this snapshot represents" },
        pi_reserve:     { bsonType: "double", description: "x — LP Pi reserve at this step" },
        token_reserve:  { bsonType: "double", description: "y — LP token reserve at this step" },
        lp_shares_holder: { bsonType: "string", description: "escrow wallet_id holding 100% of LP shares" },
        recorded_at:    { bsonType: "date" }
      }
    }
  }
});

db.createCollection("price_analysis", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["analysis_id", "launch_id", "k_invariant", "p_list", "p_floor"],
      properties: {
        analysis_id:          { bsonType: "string" },
        launch_id:            { bsonType: "string" },
        k_invariant:          { bsonType: "double", description: "k = x_TGE * y_TGE (constant product)" },
        t_out:                { bsonType: "double", description: "Tokens held outside the pool at TGE" },
        y_min:                { bsonType: "double", description: "Worst-case token reserve if all T_out sold back" },
        x_min:                { bsonType: "double", description: "Worst-case Pi reserve at y_min (via k invariant)" },
        p_list:               { bsonType: "double", description: "Listing price (Pi per token)" },
        p_floor:              { bsonType: "double", description: "Theoretical floor spot price (Pi per token)" },
        p_floor_pct_of_list:  { bsonType: "double" },
        computed_at:          { bsonType: "date" }
      }
    }
  }
});

db.createCollection("swap_event", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_id", "launch_id", "tx_hash", "direction", "amount_in", "amount_out"],
      properties: {
        event_id:                  { bsonType: "string" },
        launch_id:                 { bsonType: "string" },
        chain:                     { bsonType: "string" },
        tx_hash:                   { bsonType: "string" },
        direction:                 { enum: ["pi_to_token", "token_to_pi"] },
        amount_in:                 { bsonType: "double" },
        amount_out:                { bsonType: "double" },
        pool_pi_reserve_after:     { bsonType: "double" },
        pool_token_reserve_after:  { bsonType: "double" },
        block_time:                { bsonType: "date" }
      }
    }
  }
});

// Indexes
db.launch_config.createIndex({ launch_id: 1 }, { unique: true });
db.escrow_wallet.createIndex({ wallet_id: 1 }, { unique: true });
db.escrow_wallet.createIndex({ launch_id: 1 });
db.lp_state_snapshot.createIndex({ launch_id: 1, step_label: 1 }, { unique: true });
db.price_analysis.createIndex({ launch_id: 1 }, { unique: true });
db.swap_event.createIndex({ launch_id: 1, block_time: 1 });
db.swap_event.createIndex({ tx_hash: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// 2. SEED DATA — one launch per design variant, numbers verified against the
//    closed-form results quoted in the design docs (0.238*p_list / 0.16*p_list)
// ---------------------------------------------------------------------------

db.launch_config.insertMany([
  {
    launch_id: "PIRC-D1-0001",
    project_name: "PiRC Demo Launch (Design 1)",
    design_variant: "design_1",
    chain: "pi-network-soroban",
    committed_pi: 1000000.0,
    launch_token_allocation: 1000000.0,
    engagement_allocation: 50000.0, // 5% of T
    created_at: new Date("2026-01-10T00:00:00Z")
  },
  {
    launch_id: "PIRC-D2-0001",
    project_name: "PiRC Demo Launch (Design 2)",
    design_variant: "design_2",
    chain: "pi-network-soroban",
    committed_pi: 1000000.0,
    launch_token_allocation: 1000000.0,
    engagement_allocation: null,
    created_at: new Date("2026-01-10T00:00:00Z")
  }
]);

db.escrow_wallet.insertMany([
  {
    wallet_id: "ESCROW-D1-0001",
    launch_id: "PIRC-D1-0001",
    address: "CESCROWD1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    chain: "pi-network-soroban",
    lp_shares_pct: 100.0,
    permanently_locked: true,
    locked_at: new Date("2026-01-15T00:00:00Z")
  },
  {
    wallet_id: "ESCROW-D2-0001",
    launch_id: "PIRC-D2-0001",
    address: "CESCROWD2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    chain: "pi-network-soroban",
    lp_shares_pct: 100.0,
    permanently_locked: true,
    locked_at: new Date("2026-01-20T00:00:00Z")
  }
]);

// Design 1: single deposit() at TGE — LP seeded with all committed Pi (C) and
// the full liquidity bucket (T) in one step.
db.lp_state_snapshot.insertOne({
  snapshot_id: "SNAP-D1-TGE",
  launch_id: "PIRC-D1-0001",
  step_label: "tge",
  pi_reserve: 1000000.0,      // x_TGE = C
  token_reserve: 1000000.0,   // y_TGE = T
  lp_shares_holder: "ESCROW-D1-0001",
  recorded_at: new Date("2026-01-15T00:05:00Z")
});

// Design 2: phased — step_2 (80% T / 50% C) then step_3 (40% T / 100% C)
db.lp_state_snapshot.insertMany([
  {
    snapshot_id: "SNAP-D2-STEP2",
    launch_id: "PIRC-D2-0001",
    step_label: "step_2",
    pi_reserve: 500000.0,     // 50% of C
    token_reserve: 800000.0,  // 80% of T
    lp_shares_holder: "ESCROW-D2-0001",
    recorded_at: new Date("2026-01-20T00:05:00Z")
  },
  {
    snapshot_id: "SNAP-D2-STEP3",
    launch_id: "PIRC-D2-0001",
    step_label: "step_3",
    pi_reserve: 1000000.0,    // 100% of C
    token_reserve: 400000.0,  // 40% of T (swaps only, no further deposits)
    lp_shares_holder: "ESCROW-D2-0001",
    recorded_at: new Date("2026-01-22T00:05:00Z")
  },
  {
    // TGE == the step_3 state for design_2 (market opens once step_3 completes)
    snapshot_id: "SNAP-D2-TGE",
    launch_id: "PIRC-D2-0001",
    step_label: "tge",
    pi_reserve: 1000000.0,
    token_reserve: 400000.0,
    lp_shares_holder: "ESCROW-D2-0001",
    recorded_at: new Date("2026-01-22T00:05:00Z")
  }
]);

// Precomputed price_analysis (see Section 3 for the aggregation that derives
// these numbers live from lp_state_snapshot + launch_config).
db.price_analysis.insertMany([
  {
    analysis_id: "PRICE-D1-0001",
    launch_id: "PIRC-D1-0001",
    k_invariant: 1000000.0 * 1000000.0,          // C * T = 1e12
    t_out: 1000000.0 + 50000.0,                  // T + T_engage
    y_min: 2 * 1000000.0 + 50000.0,               // 2T + T_engage
    x_min: (1000000.0 * 1000000.0) / (2 * 1000000.0 + 50000.0),
    p_list: 1000000.0 / 1000000.0,                // C / T
    p_floor: ((1000000.0 * 1000000.0) / (2 * 1000000.0 + 50000.0)) / (2 * 1000000.0 + 50000.0),
    p_floor_pct_of_list: 23.8,
    computed_at: new Date("2026-01-15T00:10:00Z")
  },
  {
    analysis_id: "PRICE-D2-0001",
    launch_id: "PIRC-D2-0001",
    k_invariant: 1000000.0 * 400000.0,            // C * 0.4T = 4e11
    t_out: 600000.0,                              // 0.6T
    y_min: 1000000.0,                             // 0.4T + 0.6T = T
    x_min: 400000.0,                              // 0.4C
    p_list: 1000000.0 / 400000.0,                 // C / 0.4T = 2.5
    p_floor: 400000.0 / 1000000.0,                // 0.4
    p_floor_pct_of_list: 16.0,
    computed_at: new Date("2026-01-22T00:10:00Z")
  }
]);

db.swap_event.insertMany([
  {
    event_id: "SWAP-D1-0001",
    launch_id: "PIRC-D1-0001",
    chain: "pi-network-soroban",
    tx_hash: "d1demo0000000000000000000000000000000000000000000001",
    direction: "token_to_pi",
    amount_in: 10000.0,
    amount_out: 9803.9, // approx, constant-product w/ no fee for demo purposes
    pool_pi_reserve_after: 990196.1,
    pool_token_reserve_after: 1010000.0,
    block_time: new Date("2026-01-16T09:00:00Z")
  },
  {
    event_id: "SWAP-D2-0001",
    launch_id: "PIRC-D2-0001",
    chain: "pi-network-soroban",
    tx_hash: "d2demo0000000000000000000000000000000000000000000001",
    direction: "pi_to_token",
    amount_in: 5000.0,
    amount_out: 1976.3,
    pool_pi_reserve_after: 1005000.0,
    pool_token_reserve_after: 398023.7,
    block_time: new Date("2026-01-23T09:00:00Z")
  }
]);

// ---------------------------------------------------------------------------
// 3. QUERIES / AGGREGATION PIPELINES (full MQL: $lookup, $group, $addFields)
// ---------------------------------------------------------------------------

/**
 * 3.1 Live price-floor recomputation directly from lp_state_snapshot +
 *     launch_config, joined via $lookup — cross-checks the stored
 *     price_analysis rows instead of trusting them blindly.
 */
function recomputePriceFloor() {
  return db.lp_state_snapshot.aggregate([
    { $match: { step_label: "tge" } },
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
        C: "$config.committed_pi",
        T: "$config.launch_token_allocation",
        T_engage: { $ifNull: ["$config.engagement_allocation", 0.0] },
        design: "$config.design_variant",
        x_tge: "$pi_reserve",
        y_tge: "$token_reserve"
      }
    },
    {
      $addFields: {
        k: { $multiply: ["$x_tge", "$y_tge"] },
        // T_out differs by design: design_1 => T + T_engage (full remaining
        // supply outside pool); design_2 => T - y_tge (remaining launch
        // allocation not yet in the pool).
        t_out: {
          $cond: [
            { $eq: ["$design", "design_1"] },
            { $add: ["$T", "$T_engage"] },
            { $subtract: ["$T", "$y_tge"] }
          ]
        }
      }
    },
    {
      $addFields: {
        y_min: { $add: ["$y_tge", "$t_out"] }
      }
    },
    {
      $addFields: {
        x_min: { $divide: ["$k", "$y_min"] },
        p_list: {
          $cond: [
            { $eq: ["$design", "design_1"] },
            { $divide: ["$C", "$T"] },
            { $divide: ["$C", "$y_tge"] } // C / 0.4T for design_2
          ]
        }
      }
    },
    {
      $addFields: {
        p_floor: { $divide: ["$x_min", "$y_min"] }
      }
    },
    {
      $addFields: {
        p_floor_pct_of_list: {
          $round: [{ $multiply: [{ $divide: ["$p_floor", "$p_list"] }, 100] }, 2]
        }
      }
    },
    {
      $project: {
        _id: 0,
        launch_id: 1,
        design: 1,
        k: 1,
        t_out: 1,
        y_min: 1,
        x_min: 1,
        p_list: 1,
        p_floor: 1,
        p_floor_pct_of_list: 1
      }
    }
  ]).toArray();
}

/**
 * 3.2 Full rollout timeline per launch (step_2 -> step_3 -> tge reserves),
 *     useful for a dashboard chart of LP composition over time.
 */
function rolloutTimeline(launchId) {
  return db.lp_state_snapshot.aggregate([
    { $match: { launch_id: launchId } },
    { $sort: { recorded_at: 1, step_label: 1 } },
    {
      $project: {
        _id: 0,
        step_label: 1,
        pi_reserve: 1,
        token_reserve: 1,
        recorded_at: 1
      }
    }
  ]).toArray();
}

/**
 * 3.3 Confirms every escrow wallet backing a live launch is permanently
 *     locked (the "no team can drain liquidity" invariant from both designs).
 */
function unlockedEscrowAudit() {
  return db.escrow_wallet.find({ permanently_locked: false }).toArray();
}

// Demo run (comment out in production import scripts):
printjson({
  recomputed_price_floor: recomputePriceFloor(),
  d2_timeline: rolloutTimeline("PIRC-D2-0001"),
  unlocked_escrow_wallets: unlockedEscrowAudit() // should be [] — invariant holds
});
