"""
PiRC - Section 4: Allocation Period - v2.0.0
Covers Design Option 1 (deposit-only, tiered discount) and
Design Option 2 (deposit + swap, continuous discount curve).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Any

# ─────────────────────────────────────────────
# 1. STATIC DATABASE
# ─────────────────────────────────────────────

PIRC_ALLOCATION_DB: Dict[str, Any] = {
    "document": {
        "title": "PiRC - Section 4: Allocation Period",
        "version": "2.0.0",
        "next_section": "5-tge-state",
    },
    "notation": {
        "T": {"symbol": "T", "name": "Total Ecosystem Token Allocation", "unit": "tokens"},
        "C": {"symbol": "C", "name": "Total Pi Committed", "unit": "Pi"},
        "p_list": {"symbol": "p_list", "name": "Listing Price", "unit": "Pi/token"},
        "T_engage": {"symbol": "T_engage", "name": "Engagement Bonus Bucket (Design 1)",
                     "fraction": 0.05, "unit": "tokens"},
    },
    "design1": {
        "label": "Design Option 1 - Deposit-Only Model",
        "token_buckets": {
            "purchase": {"fraction": 1.00, "destination": "Participants (base allocation)"},
            "liquidity": {"fraction": 1.00, "destination": "Liquidity Pool (LP)"},
            "engage": {"fraction": 0.05, "destination": "Engagement bonus tiers"},
        },
        "engagement_tiers": [
            {"tier": "top", "rank_range": (0.0, 1 / 3), "engage_share": 2 / 3,
             "avg_bonus_pct": 10.0, "p_eff_over_p_list": 0.909},
            {"tier": "middle", "rank_range": (1 / 3, 2 / 3), "engage_share": 1 / 3,
             "avg_bonus_pct": 5.0, "p_eff_over_p_list": 0.952},
            {"tier": "bottom", "rank_range": (2 / 3, 1.0), "engage_share": 0.0,
             "avg_bonus_pct": 0.0, "p_eff_over_p_list": 1.000},
        ],
    },
    "design2": {
        "label": "Design Option 2 - Deposit + Swap Model",
        "token_split": {
            "lp_portion": {"fraction": 0.8, "destination": "Liquidity Pool (LP)"},
            "fixed_price_portion": {"fraction": 0.2, "destination": "Sold at Listing Price to Pioneers"},
        },
        "pi_split": {
            "bucket_A": {"fraction": 0.5, "purpose": "Direct purchase of 20% of T at listing price"},
            "bucket_B": {"fraction": 0.5, "purpose": "Engagement-ranked swaps from LP"},
        },
        "effective_price_data": [
            {"s_fraction": 0.0, "p_eff_norm": 0.400}, {"s_fraction": 0.1, "p_eff_norm": 0.465},
            {"s_fraction": 0.2, "p_eff_norm": 0.529}, {"s_fraction": 0.3, "p_eff_norm": 0.594},
            {"s_fraction": 0.4, "p_eff_norm": 0.658}, {"s_fraction": 0.5, "p_eff_norm": 0.720},
            {"s_fraction": 0.6, "p_eff_norm": 0.780}, {"s_fraction": 0.7, "p_eff_norm": 0.839},
            {"s_fraction": 0.8, "p_eff_norm": 0.895}, {"s_fraction": 0.9, "p_eff_norm": 0.949},
            {"s_fraction": 1.0, "p_eff_norm": 1.000},
        ],
    },
    "chains": {
        "supported": ["Pi Network (Stellar/Soroban)", "Solana", "Ethereum"],
        "default_settlement": "Pi Network (Stellar/Soroban)",
    },
}


# ─────────────────────────────────────────────
# 2. DESIGN OPTION 1 CALCULATOR
# ─────────────────────────────────────────────

@dataclass
class ParticipantSummaryD1:
    pi_committed: float
    tier: str
    tokens_base: float
    tokens_bonus: float
    tokens_total: float
    effective_price: float
    discount_percent: float


class PiRCAllocationCalculatorD1:
    """Design Option 1: deposit-only LP formation with tiered engagement bonus."""

    def __init__(self, T: float, C: float):
        if T <= 0 or C <= 0:
            raise ValueError("T and C must be positive numbers.")
        self.T = T
        self.C = C
        self.p_list = C / T
        self.T_engage = 0.05 * T

    @staticmethod
    def tier_for(rank_fraction: float) -> str:
        if rank_fraction < 1 / 3:
            return "top"
        if rank_fraction < 2 / 3:
            return "middle"
        return "bottom"

    @staticmethod
    def bonus_pct_for(rank_fraction: float) -> float:
        tier = PiRCAllocationCalculatorD1.tier_for(rank_fraction)
        return {"top": 10.0, "middle": 5.0, "bottom": 0.0}[tier]

    def participant_summary(self, pi_committed: float, rank_fraction: float) -> ParticipantSummaryD1:
        tokens_base = pi_committed / self.p_list
        bonus_pct = self.bonus_pct_for(rank_fraction)
        tokens_bonus = tokens_base * (bonus_pct / 100)
        tokens_total = tokens_base + tokens_bonus
        effective_price = pi_committed / tokens_total

        return ParticipantSummaryD1(
            pi_committed=pi_committed,
            tier=self.tier_for(rank_fraction),
            tokens_base=tokens_base,
            tokens_bonus=tokens_bonus,
            tokens_total=tokens_total,
            effective_price=effective_price,
            discount_percent=((self.p_list - effective_price) / self.p_list) * 100,
        )

    def pool_summary(self) -> Dict[str, float]:
        return {
            "T": self.T,
            "C": self.C,
            "p_list": self.p_list,
            "T_engage": self.T_engage,
            "total_circulating_supply": 2.05 * self.T,
        }


# ─────────────────────────────────────────────
# 3. DESIGN OPTION 2 CALCULATOR
# ─────────────────────────────────────────────

@dataclass
class ParticipantSummaryD2:
    pi_committed: float
    s_cumulative: float
    bucket_a: Dict[str, float]
    bucket_b: Dict[str, float]
    total_tokens: float
    effective_price: float
    discount_percent: float


class PiRCAllocationCalculatorD2:
    """Design Option 2: deposit + engagement-ranked swap LP formation."""

    def __init__(self, T: float, C: float):
        if T <= 0 or C <= 0:
            raise ValueError("T and C must be positive numbers.")
        self.T = T
        self.C = C
        self.p_list = C / (0.4 * T)
        self.k = 0.4 * C * T
        self.x0 = C / 2
        self.y0 = 0.8 * T
        self.p_init = self.p_list / 4

    def x_at_s(self, s: float) -> float:
        return self.x0 + s

    def y_at_s(self, s: float) -> float:
        return self.k / self.x_at_s(s)

    def p_swap(self, s: float) -> float:
        x = self.x_at_s(s)
        return (x * x) / self.k

    def p_swap_norm(self, s: float) -> float:
        return 0.25 * (1 + (2 * s) / self.C) ** 2

    def p_eff(self, s: float) -> float:
        ps = self.p_swap(s)
        return (2 * self.p_list * ps) / (self.p_list + ps)

    def discount_percent(self, s: float) -> float:
        return ((self.p_list - self.p_eff(s)) / self.p_list) * 100

    def participant_summary(self, pi_committed: float, s: float) -> ParticipantSummaryD2:
        half_pi = pi_committed / 2
        tokens_a = half_pi / self.p_list
        tokens_b = half_pi / self.p_swap(s)
        total_tokens = tokens_a + tokens_b
        effective_price = pi_committed / total_tokens

        return ParticipantSummaryD2(
            pi_committed=pi_committed,
            s_cumulative=s,
            bucket_a={"pi_used": half_pi, "tokens_received": tokens_a, "price": self.p_list},
            bucket_b={"pi_used": half_pi, "tokens_received": tokens_b, "price": self.p_swap(s)},
            total_tokens=total_tokens,
            effective_price=effective_price,
            discount_percent=self.discount_percent(s),
        )

    def effective_price_curve(self, n: int = 11) -> List[Dict[str, float]]:
        half_c = self.C / 2
        curve = []
        for i in range(n):
            s = (i / (n - 1)) * half_c
            p_eff = self.p_eff(s)
            curve.append({
                "s": s,
                "s_fraction": s / half_c,
                "p_swap": self.p_swap(s),
                "p_swap_norm": self.p_swap_norm(s),
                "p_eff": p_eff,
                "p_eff_norm": p_eff / self.p_list,
                "discount": self.discount_percent(s),
            })
        return curve

    def pool_summary(self) -> Dict[str, float]:
        return {
            "T": self.T,
            "C": self.C,
            "p_list": self.p_list,
            "p_init": self.p_init,
            "k": self.k,
            "lp_pi_reserve": self.x0,
            "lp_token_reserve": self.y0,
            "min_eff_price": self.p_eff(0),
            "max_eff_price": self.p_eff(self.C / 2),
            "max_discount_pct": self.discount_percent(0),
            "min_discount_pct": self.discount_percent(self.C / 2),
        }


# ─────────────────────────────────────────────
# 4. DEMO
# ─────────────────────────────────────────────

def run_demo() -> None:
    print("=== Design 1 Demo (Deposit-Only) ===")
    d1 = PiRCAllocationCalculatorD1(T=1_000_000, C=250_000)
    print(d1.pool_summary())
    for pi, rank in [(5000, 0.05), (2000, 0.40), (1000, 0.85)]:
        print(d1.participant_summary(pi, rank))

    print("\n=== Design 2 Demo (Deposit + Swap) ===")
    d2 = PiRCAllocationCalculatorD2(T=1_000_000, C=400_000)
    print(d2.pool_summary())
    for point in d2.effective_price_curve():
        print(point)
    for pi, s in [(1000, 0), (1000, 100_000), (1000, 200_000)]:
        print(d2.participant_summary(pi, s))


if __name__ == "__main__":
    run_demo()
