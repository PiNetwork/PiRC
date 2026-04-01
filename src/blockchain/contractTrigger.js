import { triggerProtection } from "../blockchain/contractTrigger.js";

if (analysis.risk === "HIGH") {
  await triggerProtection("PAUSE");

  return {
    action: "PAUSE_NETWORK",
    message: "Smart contract paused"
  };
}
