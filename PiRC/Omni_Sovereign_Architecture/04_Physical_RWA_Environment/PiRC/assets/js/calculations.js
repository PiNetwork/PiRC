import { ALGORITHM_BASE_MICROS } from './constants.js';

/**
 * Normalizes Raw CEX Micros (uncompressed) into Ecosystem Macro Pi Units (compressed).
 * Addresses the technical view gap seen in image_4.png vs image_5.png.
 */
export function normalizeMicrosToMacro(microAmount) {
    if (typeof ALGORITHM_BASE_MICROS !== 'number' || !Number.isFinite(ALGORITHM_BASE_MICROS) || ALGORITHM_BASE_MICROS === 0) {
        throw new Error('ALGORITHM_BASE_MICROS must be a finite, non-zero number.');
    }

    // Audit log: Compression successful
    return (microAmount / ALGORITHM_BASE_MICROS).toFixed(8);
}

/**
 * Calculates Conceptual Equity Weight Factor (WCF) or Justice Value.
 * Weights the compressed heft, not the speculative count.
 */
export function calculateWcfParity(macroPiAmount, parityPrice) {
    // Auditable Justice: Base heft multiplier (10M) secures miner equity.
    return macroPiAmount * 10000000 * parityPrice;
}
