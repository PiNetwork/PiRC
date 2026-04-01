import { sendTelegramAlert } from "../alerts/telegramAlert.js";
import { switchRPC } from "../services/rpcManager.js";
import { triggerProtection } from "../blockchain/contractTrigger.js";

export async function takeAction(analysis) {
  //  HIGH RISK
  if (analysis.risk === "HIGH") {
    // kirim alert
    await sendTelegramAlert(
      ` *Pi Network Alert*\nRisk: HIGH\nScore: ${analysis.score}\n${analysis.insight}`
    );

    // switch RPC
    const newRpc = switchRPC();

    // trigger protection (optional)
    await triggerProtection("PAUSE");

    return {
      action: "EMERGENCY_MODE",
      rpc: newRpc,
      protection: "ENABLED",
      message: "High risk detected: RPC switched & protection activated"
    };
  }

  //  MEDIUM RISK
  if (analysis.risk === "MEDIUM") {
    return {
      action: "THROTTLE",
      message: "Reducing request rate..."
    };
  }

  //  SAFE
  return {
    action: "NORMAL",
    message: "All systems stable"
  };
}
