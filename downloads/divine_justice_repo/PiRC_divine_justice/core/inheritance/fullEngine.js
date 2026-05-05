import { calculateIslamicFull } from "./islamicEngine.js";

export function inheritanceEngine(data) {
  const { religion } = data;
  switch (religion) {
    case "islam":
      return calculateIslamicFull(data);
    case "christianity":
      return equalDistribution(data);
    case "judaism":
      return jewishPriorityDistribution(data);
    default:
      return equalDistribution(data);
  }
}

function equalDistribution(data) {
  const { estate, heirs } = data;
  if (!heirs || heirs.length === 0) return [];
  const share = estate / heirs.length;
  return heirs.map(h => ({ ...h, share }));
}

function jewishPriorityDistribution(data) {
  return equalDistribution(data);
}
