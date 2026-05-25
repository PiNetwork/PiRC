import { Server, Contract, TransactionBuilder, Networks } from "https://cdn.jsdelivr.net/npm/@stellar/soroban-client/+esm";

const server = new Server("https://soroban-testnet.stellar.org");

export async function getBalance(contractId, address) {
  try {
    const contract = new Contract(contractId);

    const tx = new TransactionBuilder(
      { accountId: address, sequence: "0" },
      {
        fee: "100",
        networkPassphrase: Networks.TESTNET
      }
    )
      .addOperation(contract.call("balance", address))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);

    return sim?.result?.retval || 0;

  } catch (e) {
    console.error("Soroban error:", e);
    return 0;
  }
}
