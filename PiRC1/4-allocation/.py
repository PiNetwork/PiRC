"""
bodyfail_composition.py
------------------------
Pi-Nexsus / PiRC algorithmic trading module — v2 "Composition" layer.

Decomposes OHLC candles into body/wick ratios, classifies body type,
detects body-failure trigger/confirmation events, and persists both
to a SQLite database matching schema.sql (bodyfail_compositions,
bodyfail_events, bodyfail_labels, bodyfail_stats).

Usage:
    python bodyfail_composition.py --demo --db bodyfail.db
"""

from __future__ import annotations

import argparse
import sqlite3
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Optional


# ---------------------------------------------------------------------
# Thresholds (mirrors classification_thresholds in the JSON config)
# ---------------------------------------------------------------------

DOJI_MAX_BODY_RATIO = 0.10
MARUBOZU_MIN_BODY_RATIO = 0.85
SMALL_WICK_MAX_RATIO = 0.10
LONG_WICK_MIN_RATIO = 0.60
SMALL_BODY_MAX_RATIO = 0.30

MIN_TRIGGER_BODY_RATIO = 0.70
MIN_RETRACEMENT_RATIO = 0.50


class Direction(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    FLAT = "flat"


class BodyType(str, Enum):
    DOJI = "doji"
    MARUBOZU = "marubozu"
    HAMMER = "hammer"
    HANGING_MAN = "hanging_man"
    SHOOTING_STAR = "shooting_star"
    INVERTED_HAMMER = "inverted_hammer"
    SPINNING_TOP = "spinning_top"
    NORMAL = "normal"
    FLAT = "flat"


@dataclass
class Candle:
    symbol: str
    timeframe: str
    candle_time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0


@dataclass
class Composition:
    symbol: str
    timeframe: str
    candle_time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    range_size: float
    body_size: float
    body_ratio: float
    upper_wick: float
    upper_wick_ratio: float
    lower_wick: float
    lower_wick_ratio: float
    direction: Direction
    body_type: BodyType
    is_bodyfail_trigger: bool


@dataclass
class BodyFailEvent:
    symbol: str
    timeframe: str
    trigger_time: datetime
    confirm_time: datetime
    direction_failed: Direction
    trigger_body_ratio: float
    retracement_ratio: float
    confidence: float
    status: str = "confirmed"


# ---------------------------------------------------------------------
# Core composition logic — the "compositions body" calculation
# ---------------------------------------------------------------------

def classify_body_type(body_ratio: float, upper_wick_ratio: float,
                        lower_wick_ratio: float, direction: Direction,
                        range_size: float) -> BodyType:
    if range_size <= 0:
        return BodyType.FLAT
    if body_ratio < DOJI_MAX_BODY_RATIO:
        return BodyType.DOJI
    if body_ratio > MARUBOZU_MIN_BODY_RATIO:
        return BodyType.MARUBOZU

    is_bull = direction == Direction.BULLISH
    if is_bull and lower_wick_ratio > LONG_WICK_MIN_RATIO \
            and body_ratio < SMALL_BODY_MAX_RATIO and upper_wick_ratio < SMALL_WICK_MAX_RATIO:
        return BodyType.HAMMER
    if not is_bull and lower_wick_ratio > LONG_WICK_MIN_RATIO \
            and body_ratio < SMALL_BODY_MAX_RATIO and upper_wick_ratio < SMALL_WICK_MAX_RATIO:
        return BodyType.HANGING_MAN
    if is_bull and upper_wick_ratio > LONG_WICK_MIN_RATIO \
            and body_ratio < SMALL_BODY_MAX_RATIO and lower_wick_ratio < SMALL_WICK_MAX_RATIO:
        return BodyType.SHOOTING_STAR
    if not is_bull and upper_wick_ratio > LONG_WICK_MIN_RATIO \
            and body_ratio < SMALL_BODY_MAX_RATIO and lower_wick_ratio < SMALL_WICK_MAX_RATIO:
        return BodyType.INVERTED_HAMMER
    if body_ratio < SMALL_BODY_MAX_RATIO:
        return BodyType.SPINNING_TOP
    return BodyType.NORMAL


def compose(candle: Candle) -> Composition:
    """Decompose a single candle into its body/wick composition."""
    range_size = candle.high - candle.low
    body_size = abs(candle.close - candle.open)
    direction = (Direction.BULLISH if candle.close > candle.open
                 else Direction.BEARISH if candle.close < candle.open
                 else Direction.FLAT)

    body_ratio = body_size / range_size if range_size > 0 else 0.0
    upper_wick = candle.high - max(candle.open, candle.close)
    lower_wick = min(candle.open, candle.close) - candle.low
    upper_wick_ratio = upper_wick / range_size if range_size > 0 else 0.0
    lower_wick_ratio = lower_wick / range_size if range_size > 0 else 0.0

    body_type = classify_body_type(body_ratio, upper_wick_ratio, lower_wick_ratio,
                                    direction, range_size)
    is_trigger = body_ratio >= MIN_TRIGGER_BODY_RATIO

    return Composition(
        symbol=candle.symbol, timeframe=candle.timeframe, candle_time=candle.candle_time,
        open=candle.open, high=candle.high, low=candle.low, close=candle.close,
        volume=candle.volume, range_size=range_size, body_size=body_size,
        body_ratio=round(body_ratio, 5), upper_wick=upper_wick,
        upper_wick_ratio=round(upper_wick_ratio, 5), lower_wick=lower_wick,
        lower_wick_ratio=round(lower_wick_ratio, 5), direction=direction,
        body_type=body_type, is_bodyfail_trigger=is_trigger,
    )


def detect_bodyfail_events(compositions: List[Composition]) -> List[BodyFailEvent]:
    """Scan a chronological list of compositions for trigger -> reversal pairs."""
    events: List[BodyFailEvent] = []
    for prev, curr in zip(compositions, compositions[1:]):
        if not prev.is_bodyfail_trigger or prev.body_size == 0:
            continue
        reversed_move = (
            (prev.direction == Direction.BULLISH and curr.close < prev.close) or
            (prev.direction == Direction.BEARISH and curr.close > prev.close)
        )
        retracement = abs(curr.close - prev.close) / prev.body_size
        if reversed_move and retracement >= MIN_RETRACEMENT_RATIO:
            confidence = min(1.0, prev.body_ratio * 0.6 + 0.4)
            events.append(BodyFailEvent(
                symbol=prev.symbol, timeframe=prev.timeframe,
                trigger_time=prev.candle_time, confirm_time=curr.candle_time,
                direction_failed=prev.direction, trigger_body_ratio=prev.body_ratio,
                retracement_ratio=round(retracement, 5), confidence=round(confidence, 5),
            ))
    return events


# ---------------------------------------------------------------------
# Persistence — SQLite (schema-compatible subset of schema.sql)
# ---------------------------------------------------------------------

DDL = """
CREATE TABLE IF NOT EXISTS bodyfail_compositions (
    composition_id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL, timeframe TEXT NOT NULL, candle_time TEXT NOT NULL,
    open REAL, high REAL, low REAL, close REAL, volume REAL,
    range_size REAL, body_size REAL, body_ratio REAL,
    upper_wick REAL, upper_wick_ratio REAL, lower_wick REAL, lower_wick_ratio REAL,
    direction TEXT, body_type TEXT, is_bodyfail_trigger INTEGER,
    UNIQUE(symbol, timeframe, candle_time)
);
CREATE TABLE IF NOT EXISTS bodyfail_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL, timeframe TEXT NOT NULL,
    trigger_time TEXT, confirm_time TEXT, direction_failed TEXT,
    trigger_body_ratio REAL, retracement_ratio REAL, confidence REAL,
    status TEXT DEFAULT 'confirmed'
);
CREATE TABLE IF NOT EXISTS bodyfail_labels (
    label_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES bodyfail_events(event_id),
    label TEXT NOT NULL, labeled_by TEXT DEFAULT 'system',
    labeled_at TEXT, notes TEXT
);
"""


def get_connection(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.executescript(DDL)
    return conn


def save_compositions(conn: sqlite3.Connection, comps: List[Composition]) -> None:
    conn.executemany(
        """INSERT OR IGNORE INTO bodyfail_compositions
           (symbol, timeframe, candle_time, open, high, low, close, volume,
            range_size, body_size, body_ratio, upper_wick, upper_wick_ratio,
            lower_wick, lower_wick_ratio, direction, body_type, is_bodyfail_trigger)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        [
            (c.symbol, c.timeframe, c.candle_time.isoformat(), c.open, c.high, c.low,
             c.close, c.volume, c.range_size, c.body_size, c.body_ratio, c.upper_wick,
             c.upper_wick_ratio, c.lower_wick, c.lower_wick_ratio, c.direction.value,
             c.body_type.value, int(c.is_bodyfail_trigger))
            for c in comps
        ],
    )
    conn.commit()


def save_events(conn: sqlite3.Connection, events: List[BodyFailEvent]) -> None:
    cur = conn.cursor()
    for e in events:
        cur.execute(
            """INSERT INTO bodyfail_events
               (symbol, timeframe, trigger_time, confirm_time, direction_failed,
                trigger_body_ratio, retracement_ratio, confidence, status)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (e.symbol, e.timeframe, e.trigger_time.isoformat(), e.confirm_time.isoformat(),
             e.direction_failed.value, e.trigger_body_ratio, e.retracement_ratio,
             e.confidence, e.status),
        )
        event_id = cur.lastrowid
        cur.execute(
            """INSERT INTO bodyfail_labels (event_id, label, labeled_by, labeled_at, notes)
               VALUES (?,?,?,?,?)""",
            (event_id, "true_positive", "seed_demo",
             datetime.now(timezone.utc).isoformat(), "Auto-labeled from seed data reversal"),
        )
    conn.commit()


# ---------------------------------------------------------------------
# Demo / seed data generator (mirrors schema.sql seed rows)
# ---------------------------------------------------------------------

def demo_candles() -> List[Candle]:
    base = datetime(2026, 9, 8, 0, 0, tzinfo=timezone.utc)
    raw = [
        # symbol, tf, minute_offset, o, h, l, c, v
        ("PIUSD", "M15", 0,  0.6500, 0.6620, 0.6495, 0.6610, 15320),
        ("PIUSD", "M15", 15, 0.6610, 0.6615, 0.6540, 0.6555, 9870),
        ("PIUSD", "M15", 30, 0.6555, 0.6560, 0.6510, 0.6552, 7200),
        ("PIUSD", "M15", 45, 0.6552, 0.6600, 0.6548, 0.6558, 8800),
        ("PIUSD", "M15", 60, 0.6558, 0.6562, 0.6470, 0.6555, 11200),
        ("PIUSD", "M15", 75, 0.6555, 0.6640, 0.6550, 0.6635, 16400),
        ("PIUSD", "M15", 90, 0.6635, 0.6642, 0.6560, 0.6572, 13100),
        ("PIUSD", "M15", 105, 0.6572, 0.6600, 0.6545, 0.6590, 6900),
        ("BTCUSD", "H1", 0,   58210.0, 58890.0, 58150.0, 58840.0, 421.5),
        ("BTCUSD", "H1", 60,  58840.0, 58910.0, 58020.0, 58260.0, 388.2),
        ("ETHUSD", "H1", 0,   2510.0, 2515.0, 2470.0, 2512.0, 902.0),
        ("EURUSD", "H4", 0,   1.0850, 1.0855, 1.0790, 1.0793, 0),
    ]
    candles = []
    for symbol, tf, offset, o, h, l, c, v in raw:
        candles.append(Candle(symbol, tf, base + timedelta(minutes=offset), o, h, l, c, v))
    return candles


def run_demo(db_path: Optional[str]) -> None:
    grouped: dict[tuple, List[Candle]] = {}
    for candle in demo_candles():
        grouped.setdefault((candle.symbol, candle.timeframe), []).append(candle)

    all_comps: List[Composition] = []
    all_events: List[BodyFailEvent] = []
    for (symbol, tf), candles in grouped.items():
        candles.sort(key=lambda c: c.candle_time)
        comps = [compose(c) for c in candles]
        events = detect_bodyfail_events(comps)
        all_comps.extend(comps)
        all_events.extend(events)
        print(f"\n{symbol} {tf}:")
        for c in comps:
            marker = " <-- TRIGGER" if c.is_bodyfail_trigger else ""
            print(f"  {c.candle_time}  body_ratio={c.body_ratio:.3f}  "
                  f"type={c.body_type.value:<15}{marker}")
        for e in events:
            print(f"  >> BODYFAIL EVENT: {e.trigger_time} -> {e.confirm_time}  "
                  f"failed={e.direction_failed.value}  confidence={e.confidence:.3f}")

    if db_path:
        conn = get_connection(db_path)
        save_compositions(conn, all_comps)
        save_events(conn, all_events)
        conn.close()
        print(f"\nSaved {len(all_comps)} compositions and {len(all_events)} events to {db_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="BodyFail Composition v2")
    parser.add_argument("--demo", action="store_true", help="Run with seeded demo candles")
    parser.add_argument("--db", type=str, default=None, help="SQLite DB path to persist results")
    args = parser.parse_args()

    if args.demo:
        run_demo(args.db)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
