import crypto from "crypto";
export function quantumSafeHash(data) {
  return crypto.createHash("sha3-512").update(JSON.stringify(data)).digest("hex");
}
