import fetch from "node-fetch";

export async function getPiHealth() {
  const res = await fetch("https://rpc.testnet.minepi.com", {
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

  const data = await res.json();
  return data.result || data;
}
