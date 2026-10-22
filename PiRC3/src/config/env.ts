/**
 * PiRC3 - environment config (TypeScript side)
 *
 * Centralizes env var reads for the TS database module. Reads the same
 * PIRC3_DB_PATH used by database/db.js (Node/sqlite3) and
 * database/config.py (Python), and defaults to the same sqlite file
 * under the top-level database/ folder, so all three language entry
 * points operate on one database.
 */

import path from 'path';

export interface PiRC3Env {
  /** 'development' | 'production' | 'test', from NODE_ENV. */
  nodeEnv: string;
  /** Path to the shared sqlite file (PIRC3_DB_PATH, same var as db.js/config.py). */
  dbPath: string;
  /** Path to the shared schema file (database/exchange_schema.sql at the project root). */
  schemaPath: string;
  /** Port for anything in src/ that serves HTTP (PORT env var). */
  apiPort: number;
}

// src/database/config -> project root is three levels up.
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SHARED_DATABASE_DIR = path.join(PROJECT_ROOT, 'database');

function toPositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadEnv(): PiRC3Env {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    dbPath: process.env.PIRC3_DB_PATH ?? path.join(SHARED_DATABASE_DIR, 'pirc3.db'),
    schemaPath: process.env.PIRC3_SCHEMA_PATH ?? path.join(SHARED_DATABASE_DIR, 'exchange_schema.sql'),
    apiPort: toPositiveInt(process.env.PORT, 3000),
  };
}

/** Loaded once at import time; call loadEnv() directly if you need a fresh read. */
export const env: PiRC3Env = loadEnv();
