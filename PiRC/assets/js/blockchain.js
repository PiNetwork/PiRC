const RPC_URL = "https://soroban-testnet.stellar.org";

export async function getTokenBalance(address, contractId) {
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "simulateTransaction",
        params: {
          // simplified
        }
      })
    });

    const data = await res.json();

    return data?.result || 0;
  } catch (e) {
    return 0;
  }
}
