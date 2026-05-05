export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      network: "Stellar Testnet (soroban-testnet.stellar.org)",
      pi_testnet: "rpc.testnet.minepi.com",
      status: "ONLINE",
      orchestrator_mode: "TESTNET_ONLY",
      warnings: [
        "MAINNET_WRITES_DISABLED: The orchestrator enforces testnet environments by default.",
        "AUTOMATED_SIGNING_DISABLED: Stellar testnet secrets are not consumed for automatic broadcasting.",
        "DID_CONSTRAINT: PiRC250SmartAccount and PiRC225ProofOfReserves require active Corporate/Auditor DIDs."
      ],
      timestamp: new Date().toISOString()
    })
  };
};
