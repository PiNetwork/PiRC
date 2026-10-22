"""
PiRC3 - Python entry point

Initializes the SQLite database (if needed), loads sample JSON data,
and demonstrates the rounding utility.
"""

import json
import os
import sqlite3

from utils.rounding import round_to_decimal, save_calculation

DB_PATH = os.path.join(os.path.dirname(__file__), "pirc3.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")
SAMPLE_JSON_PATH = os.path.join(os.path.dirname(__file__), "data", "sample.json")


def init_db(db_path: str = DB_PATH, schema_path: str = SCHEMA_PATH) -> None:
    """Create the database and tables from schema.sql if they don't exist."""
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()


def load_sample_data(json_path: str = SAMPLE_JSON_PATH) -> dict:
    """Load the sample.json file into a Python dict."""
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def import_sample_calculations(db_path: str, data: dict) -> None:
    """Insert the sample calculations from JSON into the database."""
    for entry in data.get("calculations", []):
        save_calculation(
            db_path=db_path,
            raw_value=entry["raw_value"],
            places=entry["decimal_places"],
            source=entry.get("source", "import"),
        )


def main() -> None:
    print("Initializing PiRC3 database...")
    init_db()

    print("Loading sample JSON data...")
    data = load_sample_data()

    print("Importing sample calculations into the database...")
    import_sample_calculations(DB_PATH, data)

    print("Example rounding:")
    example_value = 314158.4159
    print(f"  {example_value} -> {round_to_decimal(example_value, 2)}")

    print("Done.")


if __name__ == "__main__":
    main()
