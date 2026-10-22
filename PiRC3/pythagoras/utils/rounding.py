"""
PiRC3 - Rounding utility (Python)

Simple, well-tested helper functions for rounding numeric values
and persisting them to the SQLite `calculations` table defined
in schema.sql.
"""

import sqlite3
from datetime import datetime, timezone


def round_to_decimal(value: float, places: int = 2) -> float:
    """Round a numeric value to a given number of decimal places.

    Args:
        value: The raw numeric value to round.
        places: Number of decimal places to round to (default 2).

    Returns:
        The rounded float value.
    """
    return round(value, places)


def save_calculation(db_path: str, raw_value: float, places: int = 2, source: str = "python") -> int:
    """Round a value and store the result in the `calculations` table.

    Args:
        db_path: Path to the SQLite database file (e.g. 'pirc3.db').
        raw_value: The original, unrounded value.
        places: Number of decimal places to round to.
        source: Label identifying where the calculation came from.

    Returns:
        The id of the newly inserted row.
    """
    rounded_value = round_to_decimal(raw_value, places)
    created_at = datetime.now(timezone.utc).isoformat()

    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO calculations (raw_value, rounded_value, decimal_places, source, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (raw_value, rounded_value, places, source, created_at),
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


if __name__ == "__main__":
    # Example usage
    example_value = 314158.4159
    print(f"{example_value} rounded -> {round_to_decimal(example_value, 2)}")
