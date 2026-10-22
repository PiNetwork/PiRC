/**
 * PiRC3 - database connection (TypeScript side)
 *
 * A third entry point onto the same sqlite file used by database/db.js
 * (Node, callback-style sqlite3) and database/init.py (Python): all three
 * read/write the same exchange_swaps / exchange_liquidity_events tables,
 * defined once in database/exchange_schema.sql.
 *
 * Uses better-sqlite3 (synchronous) rather than mirroring db.js's async
 * wrapper, since most TS call sites here are scripts/CLIs rather than a
 * request handler that needs to stay non-blocking; wrap calls in
 * Promise.resolve()/worker threads if that changes.
 */

import fs from 'fs';
import Database from 'better-sqlite3';
import { env } from './config/env';

export interface ExchangeSwapRow {
  id: number;
  tx_hash: string;
  log_index: number;
  block_number: number;
  user_address: string;
  token_in: string;
  amount_in: string; // uint256 as string
  amount_out: string; // uint256 as string
  exchange_addr: string;
  logged_at: string;
}

export interface LiquidityEventRow {
  id: number;
  tx_hash: string;
  log_index: number;
  block_number: number;
  event_type: 'added' | 'removed';
  token_address: string;
  recipient: string | null;
  amount: string; // uint256 as string
  logged_at: string;
}

let db: Database.Database | null = null;

/** Open (or reuse) the sqlite connection, applying pragmas. Does not apply the schema. */
export function getDb(): Database.Database {
  if (db) return db;
  db = new Database(env.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

/** Apply database/exchange_schema.sql (idempotent: CREATE TABLE/INDEX IF NOT EXISTS). */
export function initializeSchema(connection: Database.Database = getDb()): void {
  const schemaSql = fs.readFileSync(env.schemaPath, 'utf8');
  connection.exec(schemaSql);
}

/** Convenience: open the connection, make sure the schema exists, return it. */
export function initDb(): Database.Database {
  const connection = getDb();
  initializeSchema(connection);
  return connection;
}

/** Run an INSERT/UPDATE/DELETE statement. */
export function run(sql: string, params: unknown[] = []): Database.RunResult {
  return getDb().prepare(sql).run(...params);
}

/** Run a SELECT and return all matching rows. */
export function all<T = unknown>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...params) as T[];
}

/** Run a SELECT and return the first matching row (or undefined). */
export function get<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
  return getDb().prepare(sql).get(...params) as T | undefined;
}

export function close(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export { env };

if (require.main === module) {
  initializeSchema();
  // eslint-disable-next-line no-console
  console.log(`PiRC3 schema applied to ${env.dbPath}`);
}
