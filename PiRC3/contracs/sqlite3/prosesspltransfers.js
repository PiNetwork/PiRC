/**
 * PiRC3 - Solana SPL token transfer processor
 *
 * Scans transactions that touch an address and stores SPL Token
 * `transfer` / `transferChecked` instructions for one mint in the
 * `safetransfer_log` table (standard = 'SPL', chain = 'solana').
 *
 * Requires: npm install @solana/web3.js sqlite3
 *
 * Usage:
 *   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com \
 *   node contracts/scripts/processSplTransfers.js --mint <MINT> [--address <ADDR>] [--limit 100]
 *
 * --address defaults to the mint. Scanning the MINT catches transferChecked
 * (what most wallets use) because the mint is listed in those transactions.
 * Legacy plain `transfer` instructions do not include the mint, so to catch
 * those, also run with --address <a token account or wallet you care about>.
 *
 * Notes: Solana addresses are case-sensitive base58 - they are NOT lowercased.
 * Progress is checkpointed by slot; duplicates are ignored by a UNIQUE key.
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DEFAULT_DB = path.join(__dirname, "..", "..", "pirc3.db");
const CHAIN = "solana";
const SPL_PROGRAMS = new Set(["spl-token", "spl-token-2022"]);

const run = (db, sql, params = []) =>
  new Promise((res, rej) => db.run(sql, params, function (e) { e ? rej(e) : res(this); }));
const get = (db, sql, params = []) =>
  new Promise((res, rej) => db.get(sql, params, (e, row) => (e ? rej(e) : res(row))));

const keyToString = (k) => (typeof k === "string" ? k : (k.pubkey ?? k).toString());

/**
 * Pull SPL transfers for `mint` out of one jsonParsed transaction.
 * Returns rows ready for storeSplTransfers().
 */
function extractSplTransfers(tx, signature, mint) {
  if (!tx || !tx.meta || tx.meta.err) return []; // skip failed transactions

  const keys = tx.transaction.message.accountKeys.map(keyToString);
  // token account address -> { mint, owner } using pre/post token balances
  const acct = new Map();
  for (const b of [...(tx.meta.preTokenBalances || []), ...(tx.meta.postTokenBalances || [])]) {
    acct.set(keys[b.accountIndex], { mint: b.mint, owner: b.owner });
  }

  const instructions = [];
  (tx.transaction.message.instructions || []).forEach((ins, i) =>
    instructions.push({ ins, logIndex: i * 1000 }));
  for (const inner of tx.meta.innerInstructions || []) {
    inner.instructions.forEach((ins, j) =>
      instructions.push({ ins, logIndex: inner.index * 1000 + j + 1 }));
  }

  const rows = [];
  for (const { ins, logIndex } of instructions) {
    if (!SPL_PROGRAMS.has(ins.program) || !ins.parsed) continue;
    const { type, info } = ins.parsed;
    if (type !== "transfer" && type !== "transferChecked") continue;

    const src = info.source, dst = info.destination;
    const insMint = info.mint || acct.get(src)?.mint || acct.get(dst)?.mint;
    if (!insMint || insMint !== mint) continue;

    rows.push({
      signature,
      logIndex,
      slot: tx.slot,
      mint: insMint,
      from: acct.get(src)?.owner ?? src,  // wallet owner when known, else token account
      to: acct.get(dst)?.owner ?? dst,
      amount: String(info.amount ?? info.tokenAmount?.amount), // u64 as string
    });
  }
  return rows;
}

async function storeSplTransfers(db, rows) {
  let inserted = 0;
  await run(db, "BEGIN");
  try {
    for (const r of rows) {
      const res = await run(
        db,
        `INSERT OR IGNORE INTO safetransfer_log
           (chain, standard, token_address, tx_hash, log_index, block_number,
            from_address, to_address, amount)
         VALUES (?, 'SPL', ?, ?, ?, ?, ?, ?, ?)`,
        [CHAIN, r.mint, r.signature, r.logIndex, r.slot, r.from, r.to, r.amount]
      );
      inserted += res.changes;
    }
    await run(db, "COMMIT");
  } catch (err) {
    await run(db, "ROLLBACK");
    throw err;
  }
  return inserted;
}

async function saveCheckpoint(db, mint, slot) {
  await run(
    db,
    `INSERT INTO indexer_checkpoints (chain, token_address, last_block)
     VALUES (?, ?, ?)
     ON CONFLICT(chain, token_address)
     DO UPDATE SET last_block = excluded.last_block, updated_at = CURRENT_TIMESTAMP`,
    [CHAIN, mint, slot]
  );
}

async function processMint({ db, connection, PublicKey, mint, address, pageSize = 100 }) {
  const cp = await get(
    db,
    "SELECT last_block FROM indexer_checkpoints WHERE chain = ? AND token_address = ?",
    [CHAIN, mint]
  );
  const lastSlot = cp ? cp.last_block : 0;
  const target = new PublicKey(address || mint);

  // signatures come newest-first; page back until we reach already-scanned slots
  const sigs = [];
  let before;
  for (;;) {
    const page = await connection.getSignaturesForAddress(target, { before, limit: pageSize });
    if (page.length === 0) break;
    let reachedOld = false;
    for (const s of page) {
      if (s.slot <= lastSlot) { reachedOld = true; break; }
      if (!s.err) sigs.push(s);
    }
    if (reachedOld) break;
    before = page[page.length - 1].signature;
  }

  let total = 0, maxSlot = lastSlot;
  sigs.reverse(); // oldest first
  for (let i = 0; i < sigs.length; i += 20) {
    const chunk = sigs.slice(i, i + 20);
    const txs = await connection.getParsedTransactions(
      chunk.map((s) => s.signature),
      { maxSupportedTransactionVersion: 0, commitment: "confirmed" }
    );
    const rows = [];
    txs.forEach((tx, k) => { rows.push(...extractSplTransfers(tx, chunk[k].signature, mint)); });
    total += await storeSplTransfers(db, rows);
    for (const s of chunk) maxSlot = Math.max(maxSlot, s.slot);
    console.log(`processed ${i + chunk.length}/${sigs.length} transactions`);
  }
  if (maxSlot > lastSlot) await saveCheckpoint(db, mint, maxSlot);
  return total;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[i + 1];
  return a;
}

async function main() {
  const { Connection, PublicKey } = require("@solana/web3.js");
  const a = parseArgs(process.argv.slice(2));
  if (!a.mint) throw new Error("Required: --mint <mint address> [--address <addr>] [--limit N]");
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", "confirmed");
  const db = new sqlite3.Database(a.db || DEFAULT_DB);
  try {
    const n = await processMint({
      db, connection, PublicKey, mint: a.mint, address: a.address,
      pageSize: a.limit ? Number(a.limit) : 100,
    });
    console.log(`Done. ${n} new SPL transfers stored.`);
  } finally {
    db.close();
  }
}

module.exports = { extractSplTransfers, storeSplTransfers, saveCheckpoint, processMint };

if (require.main === module) {
  main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
}
