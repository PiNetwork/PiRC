export function analyzeHealth(health) {
  let riskScore = 0;
  let status = "SAFE";

  if (health.status !== "healthy") riskScore += 40;
  if (health.txCount > 1000) riskScore += 30;
  if (health.ledger < 10000) riskScore += 20;

  if (riskScore > 70) status = "HIGH";
  else if (riskScore > 40) status = "MEDIUM";

  return {
    risk: status,
    score: riskScore,
    insight: generateInsight(status)
  };
}

function generateInsight(status) {
  switch (status) {
    case "HIGH":
      return "⚠️ Network anomaly detected";
    case "MEDIUM":
      return "⚡ Moderate load detected";
    default:
      return "✅ Network stable";
  }
}
