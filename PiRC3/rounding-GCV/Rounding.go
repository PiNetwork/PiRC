// Package wallet provides a single, uniform balance-rounding rule
// applied identically to every wallet. There is no owner-specific
// or role-specific branch anywhere in this file.
package wallet

import (
	"errors"
	"fmt"
	"math/big"
	"regexp"
	"strings"
)

// RoundingMode mirrors Crypto/rounding.ts.
type RoundingMode int

const (
	Floor RoundingMode = iota
	Ceil
	Nearest
)

var amountPattern = regexp.MustCompile(`^(0|[1-9]\d*)(\.\d+)?$`)

// ParseUnits converts a decimal string amount into an integer number
// of micro-units at the given decimal precision. Same contract as
// Crypto/units.ts#parseUnits.
func ParseUnits(amount string, decimals int) (*big.Int, error) {
	if decimals < 0 || decimals > 100 {
		return nil, errors.New("bilangan perpuluhan tidak sah")
	}
	if !amountPattern.MatchString(amount) {
		return nil, errors.New("format jumlah tidak sah")
	}

	parts := strings.SplitN(amount, ".", 2)
	whole := parts[0]
	fraction := ""
	if len(parts) == 2 {
		fraction = parts[1]
	}
	if len(fraction) > decimals {
		return nil, errors.New("jumlah mempunyai terlalu banyak perpuluhan")
	}
	fraction = fraction + strings.Repeat("0", decimals-len(fraction))

	scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals)), nil)

	wholeInt, ok := new(big.Int).SetString(whole, 10)
	if !ok {
		return nil, errors.New("format jumlah tidak sah")
	}
	fracInt := big.NewInt(0)
	if fraction != "" {
		fracInt, ok = new(big.Int).SetString(fraction, 10)
		if !ok {
			return nil, errors.New("format jumlah tidak sah")
		}
	}

	return new(big.Int).Add(new(big.Int).Mul(wholeInt, scale), fracInt), nil
}

// FormatUnits converts an integer micro-unit value back to a decimal string.
func FormatUnits(value *big.Int, decimals int) (string, error) {
	if decimals < 0 || decimals > 100 {
		return "", errors.New("bilangan perpuluhan tidak sah")
	}
	if value.Sign() < 0 {
		return "", errors.New("baki tidak boleh negatif")
	}
	if decimals == 0 {
		return value.String(), nil
	}

	scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals)), nil)
	whole := new(big.Int)
	frac := new(big.Int)
	whole.QuoRem(value, scale, frac)

	fracStr := fmt.Sprintf("%0*s", decimals, frac.String())
	fracStr = strings.TrimRight(fracStr, "0")
	if fracStr == "" {
		return whole.String(), nil
	}
	return whole.String() + "." + fracStr, nil
}

// RoundInteger rounds `value` to the nearest multiple of `step`
// (both expressed in micro-units), identically for every caller.
func RoundInteger(value *big.Int, step *big.Int, mode RoundingMode) (*big.Int, error) {
	if step.Sign() <= 0 {
		return nil, errors.New("step mesti lebih besar daripada sifar")
	}

	quotient := new(big.Int)
	remainder := new(big.Int)
	quotient.QuoRem(value, step, remainder)

	if remainder.Sign() == 0 {
		return new(big.Int).Set(value), nil
	}

	switch mode {
	case Floor:
		if value.Sign() < 0 {
			return new(big.Int).Mul(new(big.Int).Sub(quotient, big.NewInt(1)), step), nil
		}
		return new(big.Int).Mul(quotient, step), nil

	case Ceil:
		if value.Sign() > 0 {
			return new(big.Int).Mul(new(big.Int).Add(quotient, big.NewInt(1)), step), nil
		}
		return new(big.Int).Mul(quotient, step), nil

	case Nearest:
		absRemainder := new(big.Int).Abs(remainder)
		doubled := new(big.Int).Mul(absRemainder, big.NewInt(2))
		if doubled.Cmp(step) < 0 {
			return new(big.Int).Mul(quotient, step), nil
		}
		direction := big.NewInt(1)
		if value.Sign() < 0 {
			direction = big.NewInt(-1)
		}
		return new(big.Int).Mul(new(big.Int).Add(quotient, direction), step), nil
	}

	return nil, errors.New("kaedah pembulatan tidak sah")
}

// RoundWalletBalance rounds a decimal-string wallet amount to
// `decimals` places using round-half-up (away from zero). This is
// the single entry point every caller should use; it takes no
// account type, role, or owner flag, and behaves identically for
// every wallet by design.
func RoundWalletBalance(rawAmount string, decimals int) (string, error) {
	parts := strings.SplitN(rawAmount, ".", 2)
	fraction := ""
	if len(parts) == 2 {
		fraction = parts[1]
	}
	rawDecimals := len(fraction)

	if rawDecimals <= decimals {
		// Already within the target precision: just normalize.
		units, err := ParseUnits(rawAmount, decimals)
		if err != nil {
			return "", err
		}
		return FormatUnits(units, decimals)
	}

	// Parse at the input's own (exact) precision, then round off
	// the extra trailing digits.
	units, err := ParseUnits(rawAmount, rawDecimals)
	if err != nil {
		return "", err
	}
	step := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(rawDecimals-decimals)), nil)
	rounded, err := RoundInteger(units, step, Nearest)
	if err != nil {
		return "", err
	}
	finalUnits := new(big.Int).Quo(rounded, step)
	return FormatUnits(finalUnits, decimals)
}
