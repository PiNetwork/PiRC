// PiRC - Section 4: Allocation Period - v2.0.0
// Covers Design Option 1 (deposit-only, tiered discount) and
// Design Option 2 (deposit + swap, continuous discount curve).
//
// Build: g++ -std=c++17 -O2 -o pirc_allocation pirc_allocation.cpp

#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace pirc {

// ─────────────────────────────────────────────
// 1. DESIGN OPTION 1 CALCULATOR
// ─────────────────────────────────────────────

struct ParticipantSummaryD1 {
    double pi_committed;
    std::string tier;
    double tokens_base;
    double tokens_bonus;
    double tokens_total;
    double effective_price;
    double discount_percent;
};

class AllocationCalculatorD1 {
public:
    double T, C, p_list, T_engage;

    AllocationCalculatorD1(double T_, double C_) : T(T_), C(C_) {
        if (T <= 0 || C <= 0) {
            throw std::invalid_argument("T and C must be positive numbers.");
        }
        p_list = C / T;
        T_engage = 0.05 * T;
    }

    static std::string tierFor(double rankFraction) {
        if (rankFraction < 1.0 / 3.0) return "top";
        if (rankFraction < 2.0 / 3.0) return "middle";
        return "bottom";
    }

    static double bonusPctFor(double rankFraction) {
        const std::string tier = tierFor(rankFraction);
        if (tier == "top") return 10.0;
        if (tier == "middle") return 5.0;
        return 0.0;
    }

    ParticipantSummaryD1 participantSummary(double piCommitted, double rankFraction) const {
        const double tokensBase = piCommitted / p_list;
        const double bonusPct = bonusPctFor(rankFraction);
        const double tokensBonus = tokensBase * (bonusPct / 100.0);
        const double tokensTotal = tokensBase + tokensBonus;
        const double effectivePrice = piCommitted / tokensTotal;

        return ParticipantSummaryD1{
            piCommitted, tierFor(rankFraction), tokensBase, tokensBonus,
            tokensTotal, effectivePrice,
            ((p_list - effectivePrice) / p_list) * 100.0
        };
    }
};

// ─────────────────────────────────────────────
// 2. DESIGN OPTION 2 CALCULATOR
// ─────────────────────────────────────────────

struct BucketResult {
    double pi_used;
    double tokens_received;
    double price;
};

struct ParticipantSummaryD2 {
    double pi_committed;
    double s_cumulative;
    BucketResult bucket_a;
    BucketResult bucket_b;
    double total_tokens;
    double effective_price;
    double discount_percent;
};

struct CurvePoint {
    double s;
    double s_fraction;
    double p_swap;
    double p_swap_norm;
    double p_eff;
    double p_eff_norm;
    double discount;
};

class AllocationCalculatorD2 {
public:
    double T, C, p_list, k, x0, y0, p_init;

    AllocationCalculatorD2(double T_, double C_) : T(T_), C(C_) {
        if (T <= 0 || C <= 0) {
            throw std::invalid_argument("T and C must be positive numbers.");
        }
        p_list = C / (0.4 * T);
        k = 0.4 * C * T;
        x0 = C / 2.0;
        y0 = 0.8 * T;
        p_init = p_list / 4.0;
    }

    double xAtS(double s) const { return x0 + s; }
    double yAtS(double s) const { return k / xAtS(s); }

    double pSwap(double s) const {
        const double x = xAtS(s);
        return (x * x) / k;
    }

    double pSwapNorm(double s) const {
        return 0.25 * std::pow(1.0 + (2.0 * s) / C, 2);
    }

    double pEff(double s) const {
        const double ps = pSwap(s);
        return (2.0 * p_list * ps) / (p_list + ps);
    }

    double discountPercent(double s) const {
        return ((p_list - pEff(s)) / p_list) * 100.0;
    }

    ParticipantSummaryD2 participantSummary(double piCommitted, double s) const {
        const double halfPi = piCommitted / 2.0;
        const double tokensA = halfPi / p_list;
        const double tokensB = halfPi / pSwap(s);
        const double totalTokens = tokensA + tokensB;
        const double effectivePrice = piCommitted / totalTokens;

        return ParticipantSummaryD2{
            piCommitted, s,
            BucketResult{halfPi, tokensA, p_list},
            BucketResult{halfPi, tokensB, pSwap(s)},
            totalTokens, effectivePrice, discountPercent(s)
        };
    }

    std::vector<CurvePoint> effectivePriceCurve(int n = 11) const {
        std::vector<CurvePoint> curve;
        curve.reserve(n);
        const double halfC = C / 2.0;
        for (int i = 0; i < n; ++i) {
            const double s = (static_cast<double>(i) / (n - 1)) * halfC;
            const double pe = pEff(s);
            curve.push_back(CurvePoint{
                s, s / halfC, pSwap(s), pSwapNorm(s), pe, pe / p_list, discountPercent(s)
            });
        }
        return curve;
    }
};

} // namespace pirc

// ─────────────────────────────────────────────
// 3. DEMO
// ─────────────────────────────────────────────

int main() {
    std::cout << std::fixed << std::setprecision(4);

    std::cout << "=== Design 1 Demo (Deposit-Only) ===\n";
    pirc::AllocationCalculatorD1 d1(1'000'000.0, 250'000.0);
    std::cout << "p_list=" << d1.p_list << " T_engage=" << d1.T_engage << "\n";

    const std::vector<std::pair<double, double>> d1_participants = {
        {5000, 0.05}, {2000, 0.40}, {1000, 0.85}
    };
    for (const auto& [pi, rank] : d1_participants) {
        auto s = d1.participantSummary(pi, rank);
        std::cout << "  pi=" << s.pi_committed << " tier=" << s.tier
                   << " tokensTotal=" << s.tokens_total
                   << " effPrice=" << s.effective_price
                   << " discount%=" << s.discount_percent << "\n";
    }

    std::cout << "\n=== Design 2 Demo (Deposit + Swap) ===\n";
    pirc::AllocationCalculatorD2 d2(1'000'000.0, 400'000.0);
    std::cout << "p_list=" << d2.p_list << " p_init=" << d2.p_init << " k=" << d2.k << "\n";

    std::cout << "-- Effective price curve --\n";
    for (const auto& pt : d2.effectivePriceCurve()) {
        std::cout << "  sFraction=" << pt.s_fraction << " pEffNorm=" << pt.p_eff_norm << "\n";
    }

    std::cout << "-- Participant examples --\n";
    const std::vector<std::pair<double, double>> d2_participants = {
        {1000, 0}, {1000, 100000}, {1000, 200000}
    };
    for (const auto& [pi, s] : d2_participants) {
        auto sum = d2.participantSummary(pi, s);
        std::cout << "  pi=" << sum.pi_committed << " s=" << sum.s_cumulative
                   << " totalTokens=" << sum.total_tokens
                   << " effPrice=" << sum.effective_price
                   << " discount%=" << sum.discount_percent << "\n";
    }

    return 0;
}
