import { quantumSafeHash } from "../crypto_layer/hash.js";
export function generateProof(data) {
  return { hash: quantumSafeHash(data), proof: "zk-proof-placeholder" };
}
