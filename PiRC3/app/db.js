/**
 * PiRC3 — database layer
 *
 * Thin wrapper around sqlite3 for the off-chain exchange log
 * (see exchange_schema.sql). Design-stage: swap for a pooled/managed
 * connection before this touches real traffic.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.PIRC3_DB_PATH || path.join(__dirname, 'pirc3.db');
const SCHEMA_PATH = path.join(__dirname, 'exchange_schema.sql');

let db = null;

/** Open (or create) the sqlite database and apply the schema. */
function getDb() {
  if (db) return db;
  db = new sqlite3.Database(DB_PATH);
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema, (err) => {
    if (err) console.error('Failed to apply PiRC3 schema:', err.message);
  });
  return db;
}

/** Run an INSERT/UPDATE/DELETE statement. Returns { lastID, changes }. */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function callback(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/** Run a SELECT and return all matching rows. */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/** Run a SELECT and return the first matching row (or undefined). */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) return reject(err);
      db = null;
      resolve();
    });
  });
}

module.exports = { getDb, run, all, get, close, DB_PATH };
