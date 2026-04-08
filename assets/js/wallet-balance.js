import { wallet } from "./wallet.js";
import { Server, Contract, TransactionBuilder, Networks } from "https://cdn.jsdelivr.net/npm/@stellar/soroban-client/+esm";

const server = new Server("https://soroban-testnet.stellar.org");

export async function fetchBalances() {
  if (!wallet.address) return;

  const rows = document.querySelectorAll("tr[data-layer]");

  for (const row of rows) {
    const layer = row.getAttribute("data-layer");
    const contractId = getContractId(layer);

    const balanceEl = row.querySelector(".balance");
    const statusEl = row.querySelector(".status");

    try {
      balanceEl.innerText = "Loading...";

      const contract = new Contract(contractId);

      const tx = new TransactionBuilder(
        { accountId: wallet.address, sequence: "0" },
        {
          fee: "100",
          networkPassphrase: Networks.TESTNET
        }
      )
        .addOperation(contract.call("balance", wallet.address))
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);

      const balance = sim?.result?.retval || "0";

      balanceEl.innerText = balance;
      statusEl.innerText = "On-chain";

    } catch (err) {
      balanceEl.innerText = "Error";
      statusEl.innerText = "Fail";
      console.error(err);
    }
  }
}
