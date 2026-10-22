/**
 * PiRC3 - Rounding utility (Node.js)
 *
 * Simple, well-tested helper functions for rounding numeric values
 * and persisting them to the SQLite `calculations` table defined
 * in schema.sql.
 *
 * Requires: npm install sqlite3
 */

const sqlite3 = require("sqlite3").verbose();

/**
 * Round a numeric value to a given number of decimal places.
 * @param {number} value - The raw numeric value to round.
 * @param {number} [places=2] - Number of decimal places to round to.
 * @returns {number} The rounded value.
 */
function roundToDecimal(value, places = 2) {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}

/**
 * Round a value and store the result in the `calculations` table.
 * @param {string} dbPath - Path to the SQLite database file (e.g. 'pirc3.db').
 * @param {number} rawValue - The original, unrounded value.
 * @param {number} [places=2] - Number of decimal places to round to.
 * @param {string} [source='node'] - Label identifying where the calculation came from.
 * @returns {Promise<number>} Resolves with the id of the newly inserted row.
 */
function saveCalculation(dbPath, rawValue, places = 2, source = "node") {
  return new Promise((resolve, reject) => {
    const roundedValue = roundToDecimal(rawValue, places);
    const createdAt = new Date().toISOString();

    const db = new sqlite3.Database(dbPath);
    const sql = `
      INSERT INTO calculations (raw_value, rounded_value, decimal_places, source, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [rawValue, roundedValue, places, source, createdAt], function (err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

module.exports = { roundToDecimal, saveCalculation };

// Example usage
if (require.main === module) {
  const exampleValue = 314158.4159;
  console.log(`${exampleValue} rounded -> ${roundToDecimal(exampleValue, 2)}`);
}
