# PiRC3

## Description

PiRC3 is a module within the [PiRC](https://github.com/Tsukimarf/PiRC) project that combines a lightweight database layer, JSON-based data interchange, and mixed Python / Node.js / JavaScript tooling. This folder is intended to hold the core data-processing and utility logic for the PiRC3 component.

> **Note:** This README is a working template. Replace the placeholder sections below with the actual purpose, features, and behavior of your code once they're finalized.

## Tech Stack

- **SQLite** — local relational database for storing structured records
- **JSON** — data interchange format between Python and Node.js/JavaScript components
- **Python** — backend logic, data processing, scripting
- **Node.js** — server-side JavaScript runtime
- **JavaScript** — application/client-side logic

## Project Structure

```
PiRC3/
├── README.md
├── schema.sql          # SQLite database schema
├── data/
│   └── sample.json      # Example JSON data file
├── utils/
│   ├── rounding.py       # Python utility functions
│   └── rounding.js       # Node.js equivalent utility functions
├── main.py               # Python entry point
├── index.js              # Node.js entry point
└── requirements.txt      # Python dependencies
```

## Installation

### Prerequisites

- Python 3.9+
- Node.js 18+ (LTS recommended)
- SQLite3 (usually bundled with Python; confirm with `sqlite3 --version`)

### Setup

```bash
# Clone the repository and switch to this branch/folder
git clone https://github.com/Tsukimarf/PiRC.git
cd PiRC
git checkout Tsukimarf-patch-1
cd PiRC3

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Initialize the SQLite database from the schema
sqlite3 pirc3.db < schema.sql
```

### Running

```bash
# Run the Python entry point
python main.py

# Run the Node.js entry point
node index.js
```

## Database

The SQLite database (`pirc3.db`) is created from `schema.sql`. Example table:

```sql
CREATE TABLE IF NOT EXISTS calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_value REAL NOT NULL,
    rounded_value REAL NOT NULL,
    decimal_places INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

JSON records exchanged between the Python and Node.js sides follow this shape (see `data/sample.json`):

```json
{
  "raw_value": 314158.4159,
  "rounded_value": 314158.42,
  "decimal_places": 2
}
```

> Describe your actual table(s), fields, and relationships here once the schema is finalized.

## Utility Functions

**Python (`utils/rounding.py`)**
```python
def round_to_decimal(value: float, places: int = 2) -> float:
    """Round a numeric value to a given number of decimal places."""
    return round(value, places)
```

**Node.js (`utils/rounding.js`)**
```javascript
function roundToDecimal(value, places = 2) {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}

module.exports = { roundToDecimal };
```

## Contributing

Describe your contribution guidelines here (branching strategy, PR process, coding style, etc.).

## License

Specify your project's license here (e.g., MIT, Apache 2.0).

---

*A note on scope: this README intentionally does not include any claims about guaranteed financial returns, crypto-exchange profits, or proprietary "mathematical methods" tied to specific dollar figures. If PiRC3 is meant to document a real algorithm (geometric, statistical, or otherwise), describe its actual logic and verifiable inputs/outputs here rather than a result figure alone.*
