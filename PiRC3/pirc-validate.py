#!/usr/bin/env python3
"""
pirc3_validate.py

Security/sanity validation for PiRC3 allocation data and stablecoin
parameters, in Python. Intended as a pre-deployment check that can run in CI
or as a pre-commit hook, independent of the JS allocation engine — a second,
differently-implemented check tends to catch things a single implementation
would miss.

Usage:
    python3 pirc3_validate.py path/to/allocation_config.json
    python3 pirc3_validate.py --demo
"""

import json
import sys
import argparse
from dataclasses import dataclass, field


class ValidationError(Exception):
    pass


@dataclass
class ValidationReport:
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)

    def ok(self):
        return len(self.errors) == 0

    def add_error(self, msg):
        self.errors.append(msg)

    def add_warning(self, msg):
        self.warnings.append(msg)

    def print_summary(self):
        if self.errors:
            print(f"FAILED — {len(self.errors)} error(s):")
            for e in self.errors:
                print(f"  [ERROR] {e}")
        else:
            print("PASSED — no errors.")
        if self.warnings:
            print(f"{len(self.warnings)} warning(s):")
            for w in self.warnings:
                print(f"  [WARN] {w}")


def _sum_percentage(splits, label, report):
    total = sum(s.get("percentage", 0) for s in splits)
    if abs(total - 100) > 0.01:
        report.add_error(f"{label} percentages sum to {total}, expected 100")


def validate_allocation_config(config: dict) -> ValidationReport:
    """Structural + sanity checks mirroring pirc3-allocation-schema.json,
    plus checks that are easy to miss in a hand-rolled JS validator."""
    report = ValidationReport()

    required_top = [
        "schemaVersion", "allocationId", "totalSupply",
        "tokenSplits", "piSplits", "poolParameters", "participantTiers",
    ]
    for key in required_top:
        if key not in config:
            report.add_error(f"Missing required field: {key}")
    if not report.ok():
        return report  # structural failures block further checks

    if config["totalSupply"] <= 0:
        report.add_error("totalSupply must be positive")

    _sum_percentage(config["tokenSplits"], "tokenSplits", report)
    _sum_percentage(config["piSplits"], "piSplits", report)

    pool = config["poolParameters"]
    for key in ("listingPrice", "reserveRatio", "swapFeeBps"):
        if key not in pool:
            report.add_error(f"poolParameters missing {key}")
    if pool.get("listingPrice", 0) <= 0:
        report.add_error("poolParameters.listingPrice must be positive")
    if not (0 < pool.get("reserveRatio", 0) <= 1):
        report.add_error("poolParameters.reserveRatio must be in (0, 1]")
    if pool.get("swapFeeBps", 0) < 0:
        report.add_error("poolParameters.swapFeeBps cannot be negative")
    if pool.get("swapFeeBps", 0) > 1000:
        report.add_warning("swapFeeBps > 1000 (10%) is unusually high — confirm this is intentional")

    tiers = config["participantTiers"]
    if not tiers:
        report.add_error("participantTiers must have at least one tier")
    scores = [t.get("minScore") for t in tiers]
    if len(scores) != len(set(scores)):
        report.add_error("participantTiers has duplicate minScore values")
    for t in tiers:
        if not (0 <= t.get("discountPercent", -1) <= 100):
            report.add_error(f"tier '{t.get('tierName')}' discountPercent out of range 0-100")

    has_liquidity_split = any("liquidity" in s.get("category", "").lower() for s in config["piSplits"])
    if not has_liquidity_split:
        report.add_warning("No piSplits category contains 'liquidity' — the JS engine's pool sizing will fail on this config")

    return report


def validate_stablecoin_params(params: dict) -> ValidationReport:
    """Sanity checks for stablecoin mechanism parameters before deployment."""
    report = ValidationReport()

    required = ["pegTarget", "minCollateralizationRatio", "pegDeviationThresholdPct"]
    for key in required:
        if key not in params:
            report.add_error(f"Missing required field: {key}")
    if not report.ok():
        return report

    ratio = params["minCollateralizationRatio"]
    if ratio <= 1:
        report.add_error("minCollateralizationRatio must be > 1 (coin would be under-collateralized)")
    elif ratio < 1.05:
        report.add_warning("minCollateralizationRatio is very close to 1 — little buffer against reserve value drops")

    threshold = params["pegDeviationThresholdPct"]
    if threshold <= 0:
        report.add_error("pegDeviationThresholdPct must be positive")
    elif threshold > 10:
        report.add_warning("pegDeviationThresholdPct > 10% is a very loose peg tolerance — confirm this is intentional")

    if "REPLACE" in str(params.get("pegTarget", "")).upper() or "TBD" in str(params.get("pegTarget", "")).upper():
        report.add_error("pegTarget still contains a placeholder value — set a real target before deployment")

    return report


def demo_config():
    return {
        "schemaVersion": "1.0.0",
        "allocationId": "PiRC3-demo-001",
        "totalSupply": 1000000,
        "tokenSplits": [
            {"category": "community", "percentage": 60},
            {"category": "team", "percentage": 20, "lockupMonths": 12, "vestingMonths": 24},
            {"category": "treasury", "percentage": 20},
        ],
        "piSplits": [
            {"category": "liquidity_pool", "percentage": 70},
            {"category": "reserve", "percentage": 30},
        ],
        "poolParameters": {"listingPrice": 0.1, "reserveRatio": 0.5, "swapFeeBps": 30},
        "participantTiers": [
            {"tierName": "bronze", "minScore": 0, "discountPercent": 0},
            {"tierName": "silver", "minScore": 50, "discountPercent": 5, "allocationCap": 5000},
            {"tierName": "gold", "minScore": 100, "discountPercent": 10, "allocationCap": 20000},
        ],
    }


def main():
    parser = argparse.ArgumentParser(description="Validate PiRC3 allocation config for structural and security sanity issues.")
    parser.add_argument("config_path", nargs="?", help="Path to an allocation config JSON file")
    parser.add_argument("--demo", action="store_true", help="Run against a built-in demo config instead of a file")
    args = parser.parse_args()

    if args.demo:
        config = demo_config()
        print("Running against built-in demo config...\n")
    elif args.config_path:
        with open(args.config_path, "r") as f:
            config = json.load(f)
    else:
        parser.print_help()
        sys.exit(1)

    report = validate_allocation_config(config)
    report.print_summary()
    sys.exit(0 if report.ok() else 1)


if __name__ == "__main__":
    main()
