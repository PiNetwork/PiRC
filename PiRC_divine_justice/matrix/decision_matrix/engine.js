export function decisionMatrix(inputs) {
  return inputs.map(i => ({ ...i, weight: i.priority * i.trustScore }));
}
