/**
 * STELLAR HORIZON BRIDGE - JUSTICE ENGINE
 * Version: 1.0.0-stable
 * Purpose: Secure Testnet1/Testnet2 Integration
 * Compliance: SEP (Stellar Ecosystem Proposals) Compatible
 */

const StellarSdk = require('stellar-sdk');

const StellarConfig = {
    // Network Selection (Defaults to Testnet for Validation)
    network: {
        horizonUrl: "https://stellar.org",
        networkPassphrase: StellarSdk.Networks.TESTNET
    },

    // Justice Engine Specific Thresholds
    limits: {
        minFee: "100", // Stroops
        timeout: 30,    // Seconds
    },

    /**
     * Initializes the Horizon Server connection
     * @returns {StellarSdk.Server}
     */
    getServer: function() {
        try {
            return new StellarSdk.Server(this.network.horizonUrl);
        } catch (error) {
            console.error("[Stellar Config] Failed to initialize Horizon Server ❌");
            throw error;
        }
    },

    /**
     * Professional Asset Formatter (Justice Engine Precision)
     * Ensures all Stellar transactions meet the PiRC-260 7-decimal rule
     */
    formatAmount: function(amount) {
        return parseFloat(amount).toFixed(7);
    },

    /**
     * Health Check for Testnet1/Testnet2
     */
    checkNetworkHealth: async function() {
        const server = this.getServer();
        try {
            const result = await server.root();
            console.log(`[Stellar] Connected to Horizon v${result.horizon_version} ✅`);
            return true;
        } catch (e) {
            console.error("[Stellar] Network Unreachable ❌");
            return false;
        }
    }
};

module.exports = StellarConfig;
