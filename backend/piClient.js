const axios = require("axios");

const RPC_URL = "https://rpc.testnet.minepi.com";

async function callRPC(method, params = {}) {
  try {
    const response = await axios.post(
      RPC_URL,
      {
        jsonrpc: "2.0",
        id: 1,
        method,
        params
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("RPC Error:", error.message);
    throw error;
  }
}

// ===== FUNCTIONS =====

async function getHealth() {
  return callRPC("getHealth");
}

async function getLatestLedger() {
  const health = await getHealth();
  return health.result.latestLedger;
}

module.exports = {
  getHealth,
  getLatestLedger
};
