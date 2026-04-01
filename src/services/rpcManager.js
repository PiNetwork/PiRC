import { RPC_ENDPOINTS } from "../config/rpcList.js";

let currentIndex = 0;

export function getCurrentRPC() {
  return RPC_ENDPOINTS[currentIndex];
}

export function switchRPC() {
  currentIndex = (currentIndex + 1) % RPC_ENDPOINTS.length;
  return getCurrentRPC();
}
