import fetch from "node-fetch";

const RPC_URL = "https://rpc.testnet.minepi.com";

async function callRPC(method, params = []) {
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
    console.error("Error:", err.message);
  }
}

const methods = [
  "getHealth",
  "getLatestLedger",
  "getVersion"
];

async function main() {
  for (const m of methods) {
    const res = await callRPC(m);
    console.log("Method:", m);
    console.log("Result:", res);
    console.log("------------");
  }
}

main();
