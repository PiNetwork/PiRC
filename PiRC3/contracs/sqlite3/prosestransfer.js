/**
 * PiRC3 - ERC20 / BEP20 transfer processor
 *
 * Scans historical `Transfer` events for a token on a given chain and stores
 * them in the `safetransfer_log` table (see safetransfer_schema.sql).
 * Progress is saved in `indexer_checkpoints`, so re-running resumes where it
 * left off and never creates duplicates.
 *
 * Requires: npm install ethers sqlite3
 *
 * Usage:
 *   RPC_URL=https://bsc-dataseed.binance.org \
 *   node contracts/scripts/processSafeTransfers.js \
 *     --chain bsc --standard BEP20 --token 0xTokenAddress --from-block 40000000
 *
 *   (Ethereum example: --chain ethereum --standard ERC20 ...)
 */

const { ethers } = require("ethers");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DEFAULT_DB = path.join(__dirname, "..", "..", "pirc3.db");
const BATCH_SIZE = 2000; // many public RPCs (esp. BSC) limit getLogs range

const iface = new ethers.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const TRANSFER_TOPIC = iface.getEvent("Transfer").topicHash;

// ---------- small promise wrappers around sqlite3 ----------
const run = (db, sql, params = []) =>
  new Promise((res, rej) => db.run(sql, params, function (e) { e ? rej(e) : res(this); }));
const get = (db, sql, params = []) =>
  new Promise((res, rej) => db.get(sql, params, (e, row) => (e ? rej(e) : res(row))));

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

/** Decode raw logs and insert them atomically. Returns number of new rows. */
async function storeLogs(db, meta, logs) {
  const { chain, standard, token } = meta;
  let inserted = 0;
  await run(db, "BEGIN");
  try {
    for (const log of logs) {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (!parsed) continue;
      const r = await run(
        db,
        `INSERT OR IGNORE INTO safetransfer_log
           (chain, standard, token_address, tx_hash, log_index, block_number,
            from_address, to_address, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chain, standard, token.toLowerCase(), log.transactionHash,
          log.index ?? log.logIndex, log.blockNumber,
          parsed.args.from.toLowerCase(), parsed.args.to.toLowerCase(),
          parsed.args.value.toString(), // uint256 -> string
        ]
      );
      inserted += r.changes;
    }
    await run(db, "COMMIT");
  } catch (err) {
    await run(db, "ROLLBACK");
    throw err;
  }
  return inserted;
}

async function saveCheckpoint(db, chain, token, block) {
  await run(
    db,
    `INSERT INTO indexer_checkpoints (chain, token_address, last_block)
     VALUES (?, ?, ?)
     ON CONFLICT(chain, token_address)
     DO UPDATE SET last_block = excluded.last_block, updated_at = CURRENT_TIMESTAMP`,
    [chain, token.toLowerCase(), block]
  );
}

async function processToken({ db, provider, chain, standard, token, fromBlock }) {
  const cp = await get(
    db,
    "SELECT last_block FROM indexer_checkpoints WHERE chain = ? AND token_address = ?",
    [chain, token.toLowerCase()]
  );
  let start = cp ? cp.last_block + 1 : Number(fromBlock ?? 0);
  const latest = await provider.getBlockNumber();
  let total = 0;

  while (start <= latest) {
    const end = Math.min(start + BATCH_SIZE - 1, latest);
    const logs = await provider.getLogs({
      address: token, topics: [TRANSFER_TOPIC], fromBlock: start, toBlock: end,
    });
    total += await storeLogs(db, { chain, standard, token }, logs);
    await saveCheckpoint(db, chain, token, end);
    console.log(`blocks ${start}-${end}: ${logs.length} events`);
    start = end + 1;
  }
  return total;
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const { chain, standard, token } = a;
  if (!chain || !token || !["ERC20", "BEP20"].includes(standard)) {
    throw new Error("Required: --chain <name> --standard ERC20|BEP20 --token <address> [--from-block N]");
  }
  if (!process.env.RPC_URL) throw new Error("Set RPC_URL to a node for the chosen chain");

  const db = new sqlite3.Database(a.db || DEFAULT_DB);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  try {
    const n = await processToken({ db, provider, chain, standard, token, fromBlock: a["from-block"] });
    console.log(`Done. ${n} new transfers stored.`);
  } finally {
    db.close();
  }
}

module.exports = { storeLogs, saveCheckpoint, processToken, TRANSFER_TOPIC };

if (require.main === module) {
  main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
}
