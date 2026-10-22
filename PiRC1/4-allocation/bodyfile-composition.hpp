// bodyfail_composition.hpp
// Pi-Nexsus / PiRC algorithmic trading module — v2 "Composition" layer.
// Candle body/wick decomposition, body-type classification, and
// body-failure trigger/confirmation detection. Mirrors the SQL schema,
// MQL5 indicator, and Python module of the same version.

#pragma once

#include <string>
#include <vector>
#include <cmath>
#include <algorithm>

namespace bodyfail {

// --- thresholds (mirrors classification_thresholds in the JSON config) ---
struct Thresholds {
    double doji_max_body_ratio      = 0.10;
    double marubozu_min_body_ratio  = 0.85;
    double small_wick_max_ratio     = 0.10;
    double long_wick_min_ratio      = 0.60;
    double small_body_max_ratio     = 0.30;
    double min_trigger_body_ratio   = 0.70;
    double min_retracement_ratio    = 0.50;
};

enum class Direction { Bullish, Bearish, Flat };

enum class BodyType {
    Doji, Marubozu, Hammer, HangingMan, ShootingStar,
    InvertedHammer, SpinningTop, Normal, Flat
};

inline std::string toString(Direction d) {
    switch (d) {
        case Direction::Bullish: return "bullish";
        case Direction::Bearish: return "bearish";
        default:                 return "flat";
    }
}

inline std::string toString(BodyType t) {
    switch (t) {
        case BodyType::Doji:            return "doji";
        case BodyType::Marubozu:        return "marubozu";
        case BodyType::Hammer:          return "hammer";
        case BodyType::HangingMan:      return "hanging_man";
        case BodyType::ShootingStar:    return "shooting_star";
        case BodyType::InvertedHammer:  return "inverted_hammer";
        case BodyType::SpinningTop:     return "spinning_top";
        case BodyType::Flat:            return "flat";
        default:                        return "normal";
    }
}

struct Candle {
    std::string symbol;
    std::string timeframe;
    long long   candle_time_epoch;  // unix seconds
    double open, high, low, close, volume;
};

struct Composition {
    std::string symbol, timeframe;
    long long   candle_time_epoch;
    double open, high, low, close, volume;
    double range_size, body_size, body_ratio;
    double upper_wick, upper_wick_ratio;
    double lower_wick, lower_wick_ratio;
    Direction direction;
    BodyType  body_type;
    bool      is_bodyfail_trigger;
};

struct BodyFailEvent {
    std::string symbol, timeframe;
    long long   trigger_time_epoch, confirm_time_epoch;
    Direction   direction_failed;
    double      trigger_body_ratio;
    double      retracement_ratio;
    double      confidence;
    std::string status = "confirmed";
};

// --- classification -------------------------------------------------

inline BodyType classifyBodyType(double bodyRatio, double upperWickRatio,
                                  double lowerWickRatio, Direction direction,
                                  double rangeSize, const Thresholds& th = {}) {
    if (rangeSize <= 0.0) return BodyType::Flat;
    if (bodyRatio < th.doji_max_body_ratio) return BodyType::Doji;
    if (bodyRatio > th.marubozu_min_body_ratio) return BodyType::Marubozu;

    bool bull = (direction == Direction::Bullish);
    if (bull && lowerWickRatio > th.long_wick_min_ratio &&
        bodyRatio < th.small_body_max_ratio && upperWickRatio < th.small_wick_max_ratio)
        return BodyType::Hammer;
    if (!bull && lowerWickRatio > th.long_wick_min_ratio &&
        bodyRatio < th.small_body_max_ratio && upperWickRatio < th.small_wick_max_ratio)
        return BodyType::HangingMan;
    if (bull && upperWickRatio > th.long_wick_min_ratio &&
        bodyRatio < th.small_body_max_ratio && lowerWickRatio < th.small_wick_max_ratio)
        return BodyType::ShootingStar;
    if (!bull && upperWickRatio > th.long_wick_min_ratio &&
        bodyRatio < th.small_body_max_ratio && lowerWickRatio < th.small_wick_max_ratio)
        return BodyType::InvertedHammer;
    if (bodyRatio < th.small_body_max_ratio) return BodyType::SpinningTop;
    return BodyType::Normal;
}

// --- composition ------------------------------------------------------

inline Composition compose(const Candle& c, const Thresholds& th = {}) {
    Composition out{};
    out.symbol = c.symbol;
    out.timeframe = c.timeframe;
    out.candle_time_epoch = c.candle_time_epoch;
    out.open = c.open; out.high = c.high; out.low = c.low;
    out.close = c.close; out.volume = c.volume;

    out.range_size = c.high - c.low;
    out.body_size  = std::fabs(c.close - c.open);
    out.direction  = (c.close > c.open) ? Direction::Bullish
                    : (c.close < c.open) ? Direction::Bearish
                    : Direction::Flat;

    out.body_ratio = (out.range_size > 0.0) ? out.body_size / out.range_size : 0.0;
    out.upper_wick = c.high - std::max(c.open, c.close);
    out.lower_wick = std::min(c.open, c.close) - c.low;
    out.upper_wick_ratio = (out.range_size > 0.0) ? out.upper_wick / out.range_size : 0.0;
    out.lower_wick_ratio = (out.range_size > 0.0) ? out.lower_wick / out.range_size : 0.0;

    out.body_type = classifyBodyType(out.body_ratio, out.upper_wick_ratio,
                                      out.lower_wick_ratio, out.direction,
                                      out.range_size, th);
    out.is_bodyfail_trigger = out.body_ratio >= th.min_trigger_body_ratio;
    return out;
}

// --- bodyfail event detection -----------------------------------------

inline std::vector<BodyFailEvent> detectBodyFailEvents(
        const std::vector<Composition>& comps, const Thresholds& th = {}) {
    std::vector<BodyFailEvent> events;
    for (size_t i = 0; i + 1 < comps.size(); ++i) {
        const Composition& prev = comps[i];
        const Composition& curr = comps[i + 1];
        if (!prev.is_bodyfail_trigger || prev.body_size == 0.0) continue;

        bool reversed =
            (prev.direction == Direction::Bullish && curr.close < prev.close) ||
            (prev.direction == Direction::Bearish && curr.close > prev.close);

        double retracement = std::fabs(curr.close - prev.close) / prev.body_size;

        if (reversed && retracement >= th.min_retracement_ratio) {
            BodyFailEvent e{};
            e.symbol = prev.symbol;
            e.timeframe = prev.timeframe;
            e.trigger_time_epoch = prev.candle_time_epoch;
            e.confirm_time_epoch = curr.candle_time_epoch;
            e.direction_failed = prev.direction;
            e.trigger_body_ratio = prev.body_ratio;
            e.retracement_ratio = retracement;
            e.confidence = std::min(1.0, prev.body_ratio * 0.6 + 0.4);
            events.push_back(e);
        }
    }
    return events;
}

} // namespace bodyfail
