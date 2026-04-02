import PiRPC from "../sdk/piRpc.js";
import detector from "./anomalyDetector.js";

const rpc = new PiRPC();

class AIOracle {

  async analyzeNetwork() {
    const health = await rpc.getHealth();
    const ledger = await rpc.getLedger();

    // fake tx counter (kalau RPC belum ada tx endpoint)
    const txCount = Math.floor(Math.random() * 100);

    const anomaly = detector.detect({
      ledger: ledger || 0,
      txCount
    });

    return {
      status: health?.status || "unknown",
      ledger,
      txCount,
      anomaly,
      insight:
        anomaly.risk === "HIGH"
          ? "⚠️ Suspicious network activity detected"
          : "✅ Network stable",
      timestamp: Date.now()
    };
  }
}

export default new AIOracle();
