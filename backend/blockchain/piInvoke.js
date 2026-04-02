import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Keypair
} from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server(
  "https://rpc.testnet.minepi.com"
);

// ambil dari env (WAJIB)
const SECRET = process.env.PI_SECRET;
const CONTRACT_ID = process.env.CONTRACT_ID;

if (!SECRET) {
  throw new Error("❌ PI_SECRET belum diset di .env");
}

const source = Keypair.fromSecret(SECRET);

// 🔍 cek koneksi + akun
export async function checkAccount() {
  try {
    const account = await server.getAccount(source.publicKey());

    return {
      success: true,
      publicKey: source.publicKey(),
      sequence: account.sequence,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

// 🚀 invoke contract (core function)
export async function invokePi(method, args = []) {
  try {
    if (!CONTRACT_ID) {
      throw new Error("❌ CONTRACT_ID belum diset di .env");
    }

    const account = await server.getAccount(source.publicKey());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        SorobanRpc.Operation.invokeContract({
          contract: CONTRACT_ID,
          function: method,
          args: args,
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(source);

    // 🔍 simulate dulu (WAJIB di Soroban)
    const simulation = await server.simulateTransaction(tx);

    if (simulation.error) {
      return {
        success: false,
        stage: "SIMULATION",
        error: simulation.error,
      };
    }

    // 🚀 kirim transaksi
    const send = await server.sendTransaction(tx);

    return {
      success: true,
      hash: send.hash,
      status: send.status,
    };

  } catch (err) {
    return {
      success: false,
      stage: "EXECUTION",
      error: err.message,
    };
  }
}
