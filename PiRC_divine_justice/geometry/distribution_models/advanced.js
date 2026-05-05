export function normalizeDistribution(values) {
  const total = values.reduce((a,b)=>a+b,0);
  return values.map(v => v / total);
}
