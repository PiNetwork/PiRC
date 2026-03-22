/**
 * Vanguard Bridge - Economic Constants & Weighted Protocol (PiRC-101)
 * Optimized for complete mathematical transparency and auditability.
 */

// Ground Truth: 10 Million Micros = 1 Macro Pi (Official Mined Base)
export const ALGORITHM_BASE_MICROS = 10000000; 

// Justice Parity Anchor (Conceptual GCV)
export const JUSTICE_ANCHOR_USD = 314159; 

// Tokenized Asset Classes - Auditable Weight Mappings
export const TOKEN_SPECIFICATIONS = {
    GOLD_GCV: {
        id: "pigcv",
        color: "#FFD700", // Gold
        micros: 1000000,  // 1 Million Micros
        ratio: 10,        // 10 units = 1 Mined Pi (Transparency: 10 * 1M = 10M)
        valueUsd: JUSTICE_ANCHOR_USD, // Pegged to GCV
        canStake: true
    },
    ORANGE_REF: {
        id: "piref",
        color: "#FFA500", // Orange
        micros: 3141,     // 3141 Micros
        ratio: 1000,      // 1000 units = 1 Mined Pi (Transparency: 1000 * 3141 ≈ 3.1M [Weighted])
        valueUsd: 314.15,
        canStake: true
    },
    BLUE_INST: {
        id: "pinst",
        color: "#58a6ff", // Blue
        micros: 314,      // 314 Micros
        ratio: 10000,     // 10,000 units = 1 Mined Pi
        valueUsd: 31.41,
        canStake: false
    },
    RED_CEX: {
        id: "pcex",
        color: "#f85149", // Red
        micros: 1,        // 1 Micro base
        ratio: 10000000,  // 10,000,000 units = 1 Mined Pi
        valueUsd: 0.17,   // Speculative IOU
        canStake: false
    }
};

