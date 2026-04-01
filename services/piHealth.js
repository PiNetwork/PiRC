import fetch from "node-fetch";
import { getCurrentRPC } from "./rpcManager.js";

export async function getPiHealth() {
  const rpc = getCurrentRPC();

  const res = await fetch(rpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getHealth"
    })
  });

  return res.json();
}
