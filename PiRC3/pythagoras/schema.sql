-- PiRC3 SQLite schema
-- Run with: sqlite3 pirc3.db < schema.sql

PRAGMA foreign_keys = ON;

-- Stores numeric values processed by the rounding utilities
-- (see utils/rounding.py and utils/rounding.js)
CREATE TABLE IF NOT EXISTS calculations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_value       REAL    NOT NULL,
    rounded_value   REAL    NOT NULL,
    decimal_places  INTEGER NOT NULL DEFAULT 2,
    source          TEXT,                         -- e.g. 'python', 'node', 'manual'
    created_at      TEXT    DEFAULT CURRENT_TIMESTAMP
);

-- Optional: tracks JSON payloads exchanged between the Python and Node.js sides
CREATE TABLE IF NOT EXISTS json_records (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name       TEXT    NOT NULL,              -- e.g. 'sample.json'
    payload         TEXT    NOT NULL,               -- raw JSON stored as text
    imported_at     TEXT    DEFAULT CURRENT_TIMESTAMP
);

-- Simple key/value settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
    key             TEXT PRIMARY KEY,
    value           TEXT,
    updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_json_records_file_name ON json_records(file_name);
