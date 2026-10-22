/**
 * PiRC3 - Node.js entry point
 *
 * Initializes the SQLite database (if needed), loads sample JSON data,
 * and demonstrates the rounding utility.
 *
 * Requires: npm install sqlite3
 */

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const { roundToDecimal, saveCalculation } = require("./utils/rounding");

const DB_PATH = path.join(__dirname, "pirc3.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");
const SAMPLE_JSON_PATH = path.join(__dirname, "data", "sample.json");

/** Create the database and tables from schema.sql if they don't exist. */
function initDb(dbPath = DB_PATH, schemaPath = SCHEMA_PATH) {
  return new Promise((resolve, reject) => {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    const db = new sqlite3.Database(dbPath);

    db.exec(schemaSql, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

/** Load the sample.json file into a JS object. */
function loadSampleData(jsonPath = SAMPLE_JSON_PATH) {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  return JSON.parse(raw);
}

/** Insert the sample calculations from JSON into the database. */
async function importSampleCalculations(dbPath, data) {
  const calculations = data.calculations || [];
  for (const entry of calculations) {
    await saveCalculation(
      dbPath,
      entry.raw_value,
      entry.decimal_places,
      entry.source || "import"
    );
  }
}

async function main() {
  console.log("Initializing PiRC3 database...");
  await initDb();

  console.log("Loading sample JSON data...");
  const data = loadSampleData();

  console.log("Importing sample calculations into the database...");
  await importSampleCalculations(DB_PATH, data);

  console.log("Example rounding:");
  const exampleValue = 314158.4159;
  console.log(`  ${exampleValue} -> ${roundToDecimal(exampleValue, 2)}`);

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error running PiRC3:", err);
  process.exit(1);
});
