export function createAuditChain(records) {
  return records.map((r, i) => ({ ...r, index: i, prevHash: i > 0 ? records[i-1].hash : null }));
}
