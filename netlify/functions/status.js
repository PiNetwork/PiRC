// Read-only PiRC live status endpoint.
// Reads PUBLIC chain data only: Horizon for the master issuer account, and
// Soroban RPC `getLatestLedger` / `getNetwork` for the subscription contract's network.
// Secrets (STELLAR_TESTNET_SECRET, PI_API_KEY, OMNI_SYNC_TOKEN) are NEVER read or returned here.

const ISSUER = "GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6";
const SUBSCRIPTION = "CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV";
const HORIZON = process.env.STELLAR_HORIZON_URL || "https://rpc.testnet.minepi.com";
const SOROBAN = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org:443";

const PACKETS = [
  { color: "RED",    role: "Governance",  contract: "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO" },
  { color: "GREEN",  role: "Pi Cash",     contract: "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4" },
  { color: "ORANGE", role: "Register",    contract: "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF" },
  { color: "YELLOW", role: "Subscribe",   contract: "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF" },
  { color: "BLUE",   role: "Extend",      contract: "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD" },
  { color: "PURPLE", role: "Pay Upfront", contract: "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4" },
  { color: "GOLD",   role: "Status",      contract: "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG" }
];

async function fetchJson(url, init) {
  try {
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return { ok: false, status: r.status };
    return { ok: true, data: await r.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function jsonRpc(url, method, params) {
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: params || {} })
  });
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=10",
    "Access-Control-Allow-Origin": "*"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  const [issuerRes, ledgerRes, networkRes] = await Promise.all([
    fetchJson(`${HORIZON}/accounts/${ISSUER}`),
    jsonRpc(SOROBAN, "getLatestLedger"),
    jsonRpc(SOROBAN, "getNetwork")
  ]);

  const issuer = issuerRes.ok
    ? {
        id: issuerRes.data.account_id,
        sequence: issuerRes.data.sequence,
        subentry_count: issuerRes.data.subentry_count,
        balances: (issuerRes.data.balances || []).map(b => ({
          asset_type: b.asset_type,
          asset_code: b.asset_code,
          balance: b.balance
        })),
        signers: (issuerRes.data.signers || []).length
      }
    : { error: issuerRes.error || `HTTP ${issuerRes.status}` };

  const soroban = {
    latest_ledger: ledgerRes.ok ? ledgerRes.data.result : { error: ledgerRes.error || `HTTP ${ledgerRes.status}` },
    network: networkRes.ok ? networkRes.data.result : { error: networkRes.error || `HTTP ${networkRes.status}` }
  };

  // Surface env wiring without leaking secrets.
  const env = {
    network: process.env.NETWORK || "TESTNET",
    horizon: HORIZON,
    soroban_rpc: SOROBAN,
    stellar_secret_present: Boolean(process.env.STELLAR_TESTNET_SECRET),
    pi_api_key_present: Boolean(process.env.PI_API_KEY),
    omni_sync_token_present: Boolean(process.env.OMNI_SYNC_TOKEN)
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      timestamp: Date.now(),
      master_issuer: ISSUER,
      pirc2_subscription: SUBSCRIPTION,
      packets: PACKETS,
      issuer,
      soroban,
      env
    })
  };
};
