export function takeAction(analysis) {
  if (analysis.risk === "HIGH") {
    return {
      action: "SWITCH_RPC",
      message: "Switching to backup node..."
    };
  }

  if (analysis.risk === "MEDIUM") {
    return {
      action: "THROTTLE",
      message: "Reducing request rate..."
    };
  }

  return {
    action: "NORMAL",
    message: "All systems stable"
  };
}
