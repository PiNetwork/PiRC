"""
PiRC1 – Pi Ecosystem Token Design
Complete Python Database Engine
Source: https://github.com/PiNetwork/PiRC
"""

import json
import math
import uuid
from datetime import datetime, date
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict, field


# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
DB_PATH = Path("pirc1_database.json")
BASELINE_LOCKUP_PCT   = 0.90
BASELINE_LOCKUP_YEARS = 3.0
BASELINE_CUTOFF_DATE  = date(2026, 2, 20)


# ─────────────────────────────────────────────
# DATA CLASSES
# ─────────────────────────────────────────────
@dataclass
class Pioneer:
    id: str
    username: str
    mined_pi: float
    locked_pi: float
    lockup_start_date: str          # ISO date string
    account_created: str            # ISO date string
    kyc_verified: bool = False
    launches_participated: list     = field(default_factory=list)
    total_tokens_received: dict     = field(default_factory=dict)

    @property
    def lockup_pct(self) -> float:
        return self.locked_pi / self.mined_pi if self.mined_pi > 0 else 0.0

    @property
    def lockup_years(self) -> float:
        start = date.fromisoformat(self.lockup_start_date)
        return (date.today() - start).days / 365.25

    @property
    def baseline_pipower_eligible(self) -> bool:
        created = date.fromisoformat(self.account_created)
        return (
            self.lockup_pct >= BASELINE_LOCKUP_PCT
            and self.lockup_years >= BASELINE_LOCKUP_YEARS
            and created < BASELINE_CUTOFF_DATE
        )

    def unlocked_pi(self) -> float:
        return self.mined_pi - self.locked_pi


@dataclass
class Project:
    id: str
    name: str
    token_symbol: str
    has_working_product: bool
    total_supply: int
    tokens_for_launchpad: int
    tokens_for_liquidity: int
    tokens_for_team: int
    team_unlock_schedule_months: int
    allocation_design: str          # "design1" | "design2"
    escrow_wallet: str
    category: str = "General"
    status: str = "registration"   # registration | active | tge | post_tge
    pi_price_per_token: Optional[float] = None
    tge_date: Optional[str] = None
    use_cases: list = field(default_factory=list)


@dataclass
class LaunchParticipant:
    pioneer_id: str
    staked_pi: float
    engagement_score: float = 0.0   # 0.0 – 1.0
    pipower: float = 0.0
    tokens_committed: float = 0.0
    pi_committed: float = 0.0
    discount_pct: float = 0.0
    lock_up_months: int = 0


@dataclass
class Launch:
    id: str
    project_id: str
    allocation_design: str
    status: str = "upcoming"        # upcoming | participation | allocation | tge | closed
    total_pi_committed: float = 0.0
    total_participants: int = 0
    lp_pi_locked: float = 0.0
    lp_tokens_locked: float = 0.0
    tge_token_price_pi: Optional[float] = None
    participants: list = field(default_factory=list)


# ─────────────────────────────────────────────
# DATABASE LAYER
# ─────────────────────────────────────────────
class PiRC1Database:
    """
    In-memory + JSON-backed database for PiRC1 ecosystem data.
    """

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._data: dict = {}
        self.load()

    # ── Persistence ──────────────────────────
    def load(self):
        if self.db_path.exists():
            with open(self.db_path, "r") as f:
                self._data = json.load(f)
        else:
            self._data = {
                "meta": {"name": "PiRC1 Database", "version": "1.0.0"},
                "pioneers": [],
                "projects": [],
                "launches": [],
                "liquidity_pools": [],
                "engagement_snapshots": [],
            }
            self.save()

    def save(self):
        with open(self.db_path, "w") as f:
            json.dump(self._data, f, indent=2, default=str)

    # ── Pioneers ─────────────────────────────
    def add_pioneer(self, p: Pioneer) -> Pioneer:
        rec = asdict(p)
        # Remove computed properties before storing
        rec.pop("lockup_pct", None)
        rec.pop("lockup_years", None)
        rec.pop("baseline_pipower_eligible", None)
        self._data["pioneers"].append(rec)
        self.save()
        return p

    def get_pioneer(self, pioneer_id: str) -> Optional[dict]:
        return next((p for p in self._data["pioneers"] if p["id"] == pioneer_id), None)

    def list_pioneers(self) -> list[dict]:
        return self._data["pioneers"]

    def update_pioneer_pi(self, pioneer_id: str, mined_pi: float, locked_pi: float):
        for p in self._data["pioneers"]:
            if p["id"] == pioneer_id:
                p["mined_pi"] = mined_pi
                p["locked_pi"] = locked_pi
                self.save()
                return True
        return False

    # ── Projects ─────────────────────────────
    def add_project(self, proj: Project) -> Project:
        self._data["projects"].append(asdict(proj))
        self.save()
        return proj

    def get_project(self, project_id: str) -> Optional[dict]:
        return next((p for p in self._data["projects"] if p["id"] == project_id), None)

    def list_projects(self) -> list[dict]:
        return self._data["projects"]

    def update_project_status(self, project_id: str, status: str):
        for p in self._data["projects"]:
            if p["id"] == project_id:
                p["status"] = status
                self.save()
                return True
        return False

    # ── Launches ─────────────────────────────
    def create_launch(self, project_id: str, allocation_design: str) -> dict:
        launch = {
            "id": f"launch_{uuid.uuid4().hex[:8]}",
            "project_id": project_id,
            "allocation_design": allocation_design,
            "status": "upcoming",
            "total_pi_committed": 0.0,
            "total_participants": 0,
            "lp_pi_locked": 0.0,
            "lp_tokens_locked": 0.0,
            "tge_token_price_pi": None,
            "participants": [],
        }
        self._data["launches"].append(launch)
        self.save()
        return launch

    def get_launch(self, launch_id: str) -> Optional[dict]:
        return next((l for l in self._data["launches"] if l["id"] == launch_id), None)

    def list_launches(self) -> list[dict]:
        return self._data["launches"]


# ─────────────────────────────────────────────
# PIRC1 ENGINE – Business Logic
# ─────────────────────────────────────────────
class PiRC1Engine:
    """
    Implements all PiRC1 specification logic:
    - PiPower calculation
    - Engagement scoring
    - Design 1 & Design 2 allocation
    - Liquidity pool formation
    - TGE price discovery
    """

    def __init__(self, db: PiRC1Database):
        self.db = db

    # ── PiPower Calculation ───────────────────
    def calculate_pipower(
        self,
        pioneer_id: str,
        staked_pi: float,
        total_staked_pi_network: float,
        t_available: float,
        platform_baseline: float = 100.0,
    ) -> float:
        """
        PiPower ∝ (staked_pi / total_staked_pi) × T_available
        Long-Term Lockers who qualify get baseline PiPower auto-added.
        """
        p = self.db.get_pioneer(pioneer_id)
        if not p:
            raise ValueError(f"Pioneer {pioneer_id} not found")

        proportional = (staked_pi / total_staked_pi_network) * t_available if total_staked_pi_network > 0 else 0.0

        # Check baseline eligibility
        lockup_pct   = p["locked_pi"] / p["mined_pi"] if p["mined_pi"] > 0 else 0.0
        start        = date.fromisoformat(p["lockup_start_date"])
        lockup_years = (date.today() - start).days / 365.25
        created      = date.fromisoformat(p["account_created"])

        baseline = 0.0
        if (
            lockup_pct >= BASELINE_LOCKUP_PCT
            and lockup_years >= BASELINE_LOCKUP_YEARS
            and created < BASELINE_CUTOFF_DATE
        ):
            baseline = platform_baseline

        return round(proportional + baseline, 6)

    # ── Engagement Scoring ───────────────────
    def score_engagement(
        self,
        registered: bool,
        onboarded: bool,
        features_used: int,
        milestones_completed: int,
        max_features: int = 10,
        max_milestones: int = 5,
    ) -> float:
        """
        Returns engagement score 0.0 – 1.0
        """
        score = 0.0
        if registered:   score += 0.20
        if onboarded:    score += 0.20
        score += 0.30 * min(features_used / max_features, 1.0)
        score += 0.30 * min(milestones_completed / max_milestones, 1.0)
        return round(score, 4)

    # ── Design 1: Stability-Oriented ─────────
    def allocate_design1(
        self,
        participants: list[dict],
        t_available: float,
        total_pi_committed: float,
        project_liquidity_tokens: float,
    ) -> dict:
        """
        Design 1 – Equal token buckets for purchase and liquidity.
        Moderate engagement-based discounts.

        Returns allocation result + LP formation data.
        """
        purchase_bucket   = t_available * 0.50
        liquidity_bucket  = t_available * 0.50

        total_pipower = sum(p["pipower"] for p in participants) or 1

        allocations = []
        for p in participants:
            share = p["pipower"] / total_pipower
            tokens = round(share * purchase_bucket, 6)

            # Engagement bonus: up to 10% extra tokens (moderate)
            bonus_pct = p["engagement_score"] * 0.10
            bonus_tokens = round(tokens * bonus_pct, 6)

            allocations.append({
                "pioneer_id":      p["pioneer_id"],
                "pipower":         p["pipower"],
                "engagement_score": p["engagement_score"],
                "base_tokens":     tokens,
                "bonus_tokens":    bonus_tokens,
                "total_tokens":    round(tokens + bonus_tokens, 6),
                "pi_paid":         p["pi_committed"],
                "lock_up_months":  0,
                "discount_pct":    round(bonus_pct * 100, 2),
            })

        lp = self._form_lp(total_pi_committed, liquidity_bucket + project_liquidity_tokens)
        return {"design": "design1", "allocations": allocations, "liquidity_pool": lp}

    # ── Design 2: Engagement-Weighted ────────
    def allocate_design2(
        self,
        participants: list[dict],
        t_available: float,
        total_pi_committed: float,
        project_liquidity_tokens: float,
        base_price_pi: float,
    ) -> dict:
        """
        Design 2 – Hybrid fixed-price + swap mechanism.
        Large discounts for highly engaged users with proportional lock-ups.
        """
        # Sort by engagement score (highest first)
        sorted_p = sorted(participants, key=lambda x: x["engagement_score"], reverse=True)
        n = len(sorted_p)

        allocations = []
        for rank, p in enumerate(sorted_p):
            # Discount tiers: top 10% → 30% off, next 20% → 20% off, rest → 10% off
            if rank < n * 0.10:
                discount_pct  = 0.30
                lock_up_months = 12
            elif rank < n * 0.30:
                discount_pct  = 0.20
                lock_up_months = 6
            else:
                discount_pct  = 0.10
                lock_up_months = 3

            effective_price = base_price_pi * (1 - discount_pct)
            tokens = round(p["pi_committed"] / effective_price, 6) if effective_price > 0 else 0

            allocations.append({
                "pioneer_id":       p["pioneer_id"],
                "rank":             rank + 1,
                "engagement_score": p["engagement_score"],
                "pipower":          p["pipower"],
                "pi_paid":          p["pi_committed"],
                "effective_price_pi": round(effective_price, 6),
                "total_tokens":     tokens,
                "discount_pct":     round(discount_pct * 100, 1),
                "lock_up_months":   lock_up_months,
            })

        lp = self._form_lp(total_pi_committed, project_liquidity_tokens)
        return {"design": "design2", "allocations": allocations, "liquidity_pool": lp}

    # ── Liquidity Pool Formation ─────────────
    def _form_lp(self, pi_locked: float, tokens_locked: float) -> dict:
        """
        Forms and permanently locks the LP.
        Initial price = pi_locked / tokens_locked (Pi per token).
        """
        price = round(pi_locked / tokens_locked, 8) if tokens_locked > 0 else 0
        return {
            "pi_locked":       round(pi_locked, 6),
            "tokens_locked":   round(tokens_locked, 6),
            "initial_price_pi": price,
            "withdrawal_enabled": False,        # PERMANENTLY DISABLED per PiRC1 spec
            "formed_at":       datetime.utcnow().isoformat(),
        }

    # ── TGE Price Lower Bound ────────────────
    def tge_price_lower_bound(self, lp_pi: float, lp_tokens: float) -> float:
        """
        Mathematical lower bound for token price relative to listing.
        Per spec: price_lb = lp_pi / lp_tokens
        """
        return round(lp_pi / lp_tokens, 8) if lp_tokens > 0 else 0.0

    # ── Full Launch Simulation ────────────────
    def simulate_launch(
        self,
        project_id: str,
        participant_data: list[dict],
        allocation_design: str = "design1",
        base_price_pi: float = 1.0,
    ) -> dict:
        """
        End-to-end launch simulation for a project.
        participant_data: list of {pioneer_id, staked_pi, pi_committed, engagement_score}
        """
        project = self.db.get_project(project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        t_available    = project["tokens_for_launchpad"]
        lp_tokens      = project["tokens_for_liquidity"]
        total_staked   = sum(p["staked_pi"] for p in participant_data) or 1
        total_pi       = sum(p["pi_committed"] for p in participant_data)

        # Enrich with PiPower
        enriched = []
        for pd in participant_data:
            pp = self.calculate_pipower(pd["pioneer_id"], pd["staked_pi"], total_staked, t_available)
            enriched.append({**pd, "pipower": pp})

        if allocation_design == "design1":
            result = self.allocate_design1(enriched, t_available, total_pi, lp_tokens)
        else:
            result = self.allocate_design2(enriched, t_available, total_pi, lp_tokens, base_price_pi)

        result["project_id"]      = project_id
        result["project_name"]    = project["name"]
        result["token_symbol"]    = project["token_symbol"]
        result["total_pi_raised"] = total_pi
        result["participant_count"] = len(enriched)
        result["tge_price_lower_bound"] = self.tge_price_lower_bound(
            result["liquidity_pool"]["pi_locked"],
            result["liquidity_pool"]["tokens_locked"],
        )
        return result

    # ── Reporting ────────────────────────────
    def report_pioneer(self, pioneer_id: str) -> dict:
        p = self.db.get_pioneer(pioneer_id)
        if not p:
            return {"error": "Pioneer not found"}
        lockup_pct   = p["locked_pi"] / p["mined_pi"] if p["mined_pi"] > 0 else 0
        start        = date.fromisoformat(p["lockup_start_date"])
        lockup_years = (date.today() - start).days / 365.25
        created      = date.fromisoformat(p["account_created"])
        baseline_ok  = (
            lockup_pct >= BASELINE_LOCKUP_PCT
            and lockup_years >= BASELINE_LOCKUP_YEARS
            and created < BASELINE_CUTOFF_DATE
        )
        return {
            **p,
            "computed": {
                "lockup_pct":                round(lockup_pct * 100, 2),
                "lockup_years":              round(lockup_years, 2),
                "baseline_pipower_eligible": baseline_ok,
                "unlocked_pi":               round(p["mined_pi"] - p["locked_pi"], 4),
            }
        }

    def report_project_summary(self, project_id: str) -> dict:
        proj = self.db.get_project(project_id)
        if not proj:
            return {"error": "Project not found"}
        community_alloc = proj["tokens_for_launchpad"] + proj["tokens_for_liquidity"]
        community_pct   = round(community_alloc / proj["total_supply"] * 100, 2)
        return {
            **proj,
            "computed": {
                "community_allocation_pct": community_pct,
                "team_allocation_pct": round(proj["tokens_for_team"] / proj["total_supply"] * 100, 2),
                "product_first_compliant": proj["has_working_product"],
            }
        }


# ─────────────────────────────────────────────
# DEMO / SEED
# ─────────────────────────────────────────────
def seed_demo(db: PiRC1Database, engine: PiRC1Engine):
    print("\n=== PiRC1 Demo Seed ===\n")

    # Add pioneers
    alice = Pioneer(
        id="pioneer_alice", username="alice_pi",
        mined_pi=5000, locked_pi=4800,
        lockup_start_date="2022-01-15", account_created="2021-03-10",
        kyc_verified=True,
    )
    bob = Pioneer(
        id="pioneer_bob", username="bob_pi",
        mined_pi=300, locked_pi=200,
        lockup_start_date="2023-06-01", account_created="2022-09-20",
        kyc_verified=True,
    )
    carol = Pioneer(
        id="pioneer_carol", username="carol_pi",
        mined_pi=12000, locked_pi=10800,
        lockup_start_date="2021-05-10", account_created="2020-12-01",
        kyc_verified=True,
    )
    db.add_pioneer(alice)
    db.add_pioneer(bob)
    db.add_pioneer(carol)
    print(f"  ✓ Pioneers added: {alice.username}, {bob.username}, {carol.username}")

    # Add project
    proj = Project(
        id="proj_demoapp", name="Demo DeFi App", token_symbol="DDA",
        has_working_product=True, total_supply=1_000_000_000,
        tokens_for_launchpad=200_000_000, tokens_for_liquidity=100_000_000,
        tokens_for_team=100_000_000, team_unlock_schedule_months=24,
        allocation_design="design1",
        escrow_wallet="G_ESCROW_DEMO_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        category="DeFi", use_cases=["Payments", "Governance", "Staking"],
    )
    db.add_project(proj)
    print(f"  ✓ Project added: {proj.name} ({proj.token_symbol})")

    # Engagement scores
    alice_eng = engine.score_engagement(True, True, 8, 4)
    bob_eng   = engine.score_engagement(True, False, 2, 1)
    carol_eng = engine.score_engagement(True, True, 10, 5)
    print(f"\n  Engagement scores:")
    print(f"    alice: {alice_eng}")
    print(f"    bob:   {bob_eng}")
    print(f"    carol: {carol_eng}")

    # Pioneer reports
    for pid in ["pioneer_alice", "pioneer_bob", "pioneer_carol"]:
        r = engine.report_pioneer(pid)
        c = r["computed"]
        print(f"\n  [{r['username']}]")
        print(f"    Lockup: {c['lockup_pct']}% for {c['lockup_years']}y")
        print(f"    Baseline PiPower eligible: {c['baseline_pipower_eligible']}")
        print(f"    Unlocked Pi: {c['unlocked_pi']}")

    # Simulate launch – Design 1
    participants = [
        {"pioneer_id": "pioneer_alice", "staked_pi": 500, "pi_committed": 450, "engagement_score": alice_eng},
        {"pioneer_id": "pioneer_bob",   "staked_pi": 100, "pi_committed": 80,  "engagement_score": bob_eng},
        {"pioneer_id": "pioneer_carol", "staked_pi": 900, "pi_committed": 850, "engagement_score": carol_eng},
    ]

    print("\n  === Design 1 Launch Simulation ===")
    result1 = engine.simulate_launch("proj_demoapp", participants, "design1")
    print(f"  Project: {result1['project_name']} ({result1['token_symbol']})")
    print(f"  Total Pi raised: {result1['total_pi_raised']}")
    print(f"  LP formed: {result1['liquidity_pool']['pi_locked']} Pi + {result1['liquidity_pool']['tokens_locked']} tokens")
    print(f"  TGE price lower bound: {result1['tge_price_lower_bound']} Pi")
    print(f"  Withdrawal enabled: {result1['liquidity_pool']['withdrawal_enabled']}")
    for a in result1["allocations"]:
        print(f"    [{a['pioneer_id']}] tokens: {a['total_tokens']} | discount: {a['discount_pct']}%")

    print("\n  === Design 2 Launch Simulation ===")
    result2 = engine.simulate_launch("proj_demoapp", participants, "design2", base_price_pi=0.005)
    for a in result2["allocations"]:
        print(f"    [{a['pioneer_id']}] rank #{a['rank']} | tokens: {a['total_tokens']} | discount: {a['discount_pct']}% | lock: {a['lock_up_months']}mo")

    # Project summary
    summary = engine.report_project_summary("proj_demoapp")
    c = summary["computed"]
    print(f"\n  Project Summary:")
    print(f"    Community allocation: {c['community_allocation_pct']}%")
    print(f"    Team allocation: {c['team_allocation_pct']}%")
    print(f"    Product-first compliant: {c['product_first_compliant']}")
    print("\n  ✓ All data saved to pirc1_database.json\n")


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    db     = PiRC1Database(Path("pirc1_database.json"))
    engine = PiRC1Engine(db)
    seed_demo(db, engine)