#pragma once
// Uniform wallet balance rounding (C++17).
//
// One rule, applied identically to every wallet (owner, miner, or
// otherwise). There is no account-type, role, or "owner" branch
// anywhere in this header. Amounts are treated as non-negative
// decimal strings (matching the convention already used in
// Crypto/units.ts, where formatUnits rejects negative balances) and
// are manipulated as digit strings rather than double/float, so
// arbitrarily large balances never lose precision.

#include <stdexcept>
#include <string>

namespace wallet {

// Parses a non-negative decimal string amount (e.g. "314159.2653589")
// into a digit string representing value * 10^decimals, matching
// parseUnits() in Crypto/units.ts. Throws std::invalid_argument on
// bad input.
inline std::string ParseUnits(const std::string& amount, int decimals) {
    if (decimals < 0 || decimals > 100) {
        throw std::invalid_argument("Bilangan perpuluhan tidak sah.");
    }
    if (amount.empty()) {
        throw std::invalid_argument("Format jumlah tidak sah.");
    }

    auto dot = amount.find('.');
    std::string whole = (dot == std::string::npos) ? amount : amount.substr(0, dot);
    std::string fraction = (dot == std::string::npos) ? "" : amount.substr(dot + 1);

    if (whole.empty() || whole.find_first_not_of("0123456789") != std::string::npos) {
        throw std::invalid_argument("Format jumlah tidak sah.");
    }
    if (whole.size() > 1 && whole[0] == '0') {
        throw std::invalid_argument("Format jumlah tidak sah.");
    }
    if (!fraction.empty() &&
        fraction.find_first_not_of("0123456789") != std::string::npos) {
        throw std::invalid_argument("Format jumlah tidak sah.");
    }
    if (static_cast<int>(fraction.size()) > decimals) {
        throw std::invalid_argument("Jumlah mempunyai terlalu banyak perpuluhan.");
    }

    fraction.append(static_cast<size_t>(decimals) - fraction.size(), '0');

    std::string digits = whole + fraction;
    // Strip leading zeros, but keep at least one digit.
    size_t firstNonZero = digits.find_first_not_of('0');
    if (firstNonZero == std::string::npos) return "0";
    return digits.substr(firstNonZero);
}

// Converts a non-negative digit string (as produced by ParseUnits)
// back into a decimal string with `decimals` fractional digits,
// matching formatUnits() in Crypto/units.ts.
inline std::string FormatUnits(const std::string& units, int decimals) {
    if (decimals < 0 || decimals > 100) {
        throw std::invalid_argument("Bilangan perpuluhan tidak sah.");
    }
    std::string digits = units.empty() ? "0" : units;
    if (decimals == 0) return digits;

    if (static_cast<int>(digits.size()) <= decimals) {
        digits = std::string(static_cast<size_t>(decimals) - digits.size() + 1, '0') + digits;
    }
    std::string whole = digits.substr(0, digits.size() - decimals);
    std::string frac = digits.substr(digits.size() - decimals);

    size_t lastNonZero = frac.find_last_not_of('0');
    if (lastNonZero == std::string::npos) return whole;
    return whole + "." + frac.substr(0, lastNonZero + 1);
}

namespace detail {

// Adds 1 to a non-negative digit string, with carry propagation.
inline std::string IncrementDigits(std::string digits) {
    int i = static_cast<int>(digits.size()) - 1;
    for (; i >= 0; --i) {
        if (digits[i] != '9') {
            digits[i] += 1;
            return digits;
        }
        digits[i] = '0';
    }
    return "1" + digits;
}

}  // namespace detail

// Rounds a non-negative digit string `units` by dropping its last
// `dropDigits` digits, using round-half-up (ties round up, since
// values here are non-negative). `dropDigits` must be >= 0.
inline std::string RoundDroppingDigits(const std::string& units, int dropDigits) {
    if (dropDigits < 0) {
        throw std::invalid_argument("dropDigits mesti >= sifar.");
    }
    if (dropDigits == 0) return units;

    std::string digits = units;
    if (static_cast<int>(digits.size()) <= dropDigits) {
        digits = std::string(static_cast<size_t>(dropDigits) - digits.size() + 1, '0') + digits;
    }

    std::string kept = digits.substr(0, digits.size() - dropDigits);
    char firstDropped = digits[digits.size() - dropDigits];

    if (firstDropped >= '5') {
        kept = detail::IncrementDigits(kept);
    }

    size_t firstNonZero = kept.find_first_not_of('0');
    if (firstNonZero == std::string::npos) return "0";
    return kept.substr(firstNonZero);
}

// Rounds a decimal-string wallet amount to `decimals` places using
// round-half-up. This is the single entry point every caller should
// use; it takes no account type, role, or owner flag, and behaves
// identically for every wallet by design.
inline std::string RoundWalletBalance(const std::string& rawAmount, int decimals = 6) {
    auto dot = rawAmount.find('.');
    std::string fraction = (dot == std::string::npos) ? "" : rawAmount.substr(dot + 1);
    int rawDecimals = static_cast<int>(fraction.size());

    if (rawDecimals <= decimals) {
        return FormatUnits(ParseUnits(rawAmount, decimals), decimals);
    }

    std::string units = ParseUnits(rawAmount, rawDecimals);
    std::string roundedAtRawPrecision = RoundDroppingDigits(units, rawDecimals - decimals);
    return FormatUnits(roundedAtRawPrecision, decimals);
}

}  // namespace wallet
