import fetch from "node-fetch";

const RPC_URL = "https://rpc.testnet.minepi.com";

export async function callRPC(method, params = []) {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    });

    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error("RPC Error:", err.message);
    return null;
  }
}
