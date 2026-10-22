"""
Uniform wallet balance rounding + post-quantum encryption at rest.

Version 2 (this update) adds encryption-at-rest for stored wallet
balances, on top of the rounding logic from the previous version.

Security design, applied identically to every wallet record — there
is still no account-type, role, or "owner" branch anywhere in this
module, for rounding OR for encryption:

  1. Key encapsulation: ML-KEM-768 (CRYSTALS-Kyber, NIST FIPS 203),
     a lattice-based KEM believed to resist attacks from both
     classical and quantum computers. A KEM only establishes a
     shared secret; it is not used to encrypt bulk data directly.
  2. Data encryption: the 32-byte ML-KEM-768 shared secret is used
     directly as an AES-256-GCM key to encrypt the actual balance
     fields (raw_balance / rounded_balance) at rest. AES-256 itself
     is already considered quantum-resistant for confidentiality
     (its usable security margin under Grover's algorithm is ~128
     bits); the post-quantum requirement in this design applies to
     the *key exchange* step (ML-KEM), which is the part that
     classical RSA/ECC key exchange would NOT survive against a
     future large-scale quantum computer.

Every wallet is encrypted with the SAME master keypair and the SAME
function call path. There is no separate/weaker/owner-only path.

Dependencies (both pure-Python / well-known, installable via pip):
    pip install kyber-py cryptography
"""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from enum import Enum

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from kyber_py.ml_kem import ML_KEM_768

# ---------------------------------------------------------------------------
# Part 1: uniform rounding (unchanged behavior from the previous version)
# ---------------------------------------------------------------------------

_AMOUNT_PATTERN = re.compile(r"^(0|[1-9]\d*)(\.\d+)?$")


class RoundingMode(Enum):
    FLOOR = "floor"
    CEIL = "ceil"
    NEAREST = "nearest"


def parse_units(amount: str, decimals: int) -> int:
    """Convert a decimal string amount into an integer number of
    micro-units at the given decimal precision."""
    if not isinstance(decimals, int) or decimals < 0 or decimals > 100:
        raise ValueError("Bilangan perpuluhan tidak sah.")
    if not _AMOUNT_PATTERN.match(amount):
        raise ValueError("Format jumlah tidak sah.")

    whole, _, fraction = amount.partition(".")
    if len(fraction) > decimals:
        raise ValueError("Jumlah mempunyai terlalu banyak perpuluhan.")
    fraction = fraction.ljust(decimals, "0")

    scale = 10 ** decimals
    return int(whole) * scale + (int(fraction) if fraction else 0)


def format_units(value: int, decimals: int) -> str:
    """Convert an integer micro-unit value back to a decimal string."""
    if not isinstance(decimals, int) or decimals < 0 or decimals > 100:
        raise ValueError("Bilangan perpuluhan tidak sah.")
    if value < 0:
        raise ValueError("Baki tidak boleh negatif.")
    if decimals == 0:
        return str(value)

    scale = 10 ** decimals
    whole, frac = divmod(value, scale)
    frac_str = str(frac).rjust(decimals, "0").rstrip("0")
    return f"{whole}.{frac_str}" if frac_str else str(whole)


def round_integer(value: int, step: int, mode: RoundingMode = RoundingMode.NEAREST) -> int:
    """Round `value` to the nearest multiple of `step`, identically
    for every caller."""
    if step <= 0:
        raise ValueError("Step mesti lebih besar daripada sifar.")

    quotient = int(value / step) if value < 0 else value // step
    remainder = value - quotient * step

    if remainder == 0:
        return value

    if mode == RoundingMode.FLOOR:
        return (quotient - 1) * step if value < 0 else quotient * step

    if mode == RoundingMode.CEIL:
        return (quotient + 1) * step if value > 0 else quotient * step

    if mode == RoundingMode.NEAREST:
        abs_remainder = abs(remainder)
        if abs_remainder * 2 < step:
            return quotient * step
        direction = 1 if value > 0 else -1
        return (quotient + direction) * step

    raise ValueError("Kaedah pembulatan tidak sah.")


def round_wallet_balance(raw_amount: str, decimals: int = 6) -> str:
    """Round a decimal-string wallet amount to `decimals` places using
    round-half-up (away from zero). Same entry point, same rule, for
    every wallet — no account type, role, or owner flag.
    """
    whole, _, fraction = raw_amount.partition(".")
    raw_decimals = len(fraction)

    if raw_decimals <= decimals:
        units = parse_units(raw_amount, decimals)
        return format_units(units, decimals)

    units = parse_units(raw_amount, raw_decimals)
    step = 10 ** (raw_decimals - decimals)
    rounded = round_integer(units, step, RoundingMode.NEAREST)
    final_units = rounded // step
    return format_units(final_units, decimals)


# ---------------------------------------------------------------------------
# Part 2 (new): post-quantum encryption at rest for stored balances
# ---------------------------------------------------------------------------

_NONCE_SIZE = 12  # 96-bit nonce, standard for AES-GCM


@dataclass(frozen=True)
class WalletKeyPair:
    """ML-KEM-768 keypair used to protect stored wallet data.

    encapsulation_key: public; safe to store/share, used to encrypt.
    decapsulation_key: secret; must be kept offline/in a secure vault,
                        used to decrypt. Treat it like a private key.
    """
    encapsulation_key: bytes
    decapsulation_key: bytes


def generate_wallet_keypair() -> WalletKeyPair:
    """Generate one ML-KEM-768 keypair for the wallet-storage system.

    This is the single master keypair used for every wallet record;
    there is intentionally no per-account or owner-specific keypair.
    """
    ek, dk = ML_KEM_768.keygen()
    return WalletKeyPair(encapsulation_key=ek, decapsulation_key=dk)


def encrypt_balance_record(
    encapsulation_key: bytes,
    wallet_id: str,
    raw_balance: str,
    rounded_balance: str,
    decimals: int = 6,
) -> dict:
    """Encrypt one wallet's balance fields at rest.

    Every call follows the exact same path regardless of wallet_id:
      1. ML-KEM-768 encapsulation -> fresh shared secret + ciphertext.
      2. AES-256-GCM, keyed by that shared secret, encrypts the
         plaintext JSON payload {raw_balance, rounded_balance}.
      3. wallet_id and decimals are kept as associated (authenticated
         but non-secret) data, so a stored record can be looked up
         and tamper-checked without needing to decrypt it first.

    Returns a JSON-serializable dict safe to store in a database
    column (e.g. BYTEA/BLOB/base64 text).
    """
    shared_secret, kem_ciphertext = ML_KEM_768.encaps(encapsulation_key)

    aesgcm = AESGCM(shared_secret)
    nonce = os.urandom(_NONCE_SIZE)

    plaintext = json.dumps(
        {"raw_balance": raw_balance, "rounded_balance": rounded_balance}
    ).encode("utf-8")
    associated_data = json.dumps(
        {"wallet_id": wallet_id, "decimals": decimals}
    ).encode("utf-8")

    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)

    return {
        "wallet_id": wallet_id,
        "decimals": decimals,
        "kem_ciphertext": kem_ciphertext.hex(),
        "nonce": nonce.hex(),
        "ciphertext": ciphertext.hex(),
        "algorithm": "ML-KEM-768+AES-256-GCM",
    }


def decrypt_balance_record(decapsulation_key: bytes, record: dict) -> dict:
    """Decrypt a record produced by encrypt_balance_record().

    Raises if the ciphertext or associated data has been tampered
    with (AES-GCM authentication failure), or if it was encrypted
    under a different keypair. Same decrypt path for every record.
    """
    kem_ciphertext = bytes.fromhex(record["kem_ciphertext"])
    nonce = bytes.fromhex(record["nonce"])
    ciphertext = bytes.fromhex(record["ciphertext"])

    shared_secret = ML_KEM_768.decaps(decapsulation_key, kem_ciphertext)
    aesgcm = AESGCM(shared_secret)

    associated_data = json.dumps(
        {"wallet_id": record["wallet_id"], "decimals": record["decimals"]}
    ).encode("utf-8")

    plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data)
    payload = json.loads(plaintext.decode("utf-8"))
    payload["wallet_id"] = record["wallet_id"]
    payload["decimals"] = record["decimals"]
    return payload


if __name__ == "__main__":
    # Rounding sanity examples — unchanged from the previous version.
    print(round_wallet_balance("3.1415926535", 6))   # -> "3.141593"
    print(round_wallet_balance("0.0000005", 6))       # -> "0.000001"
    print(round_wallet_balance("12.34", 6))           # -> "12.34"

    # Encryption-at-rest round-trip, using one shared master keypair
    # for both an "ordinary" wallet and an "owner" wallet — same
    # function, same algorithm, no special case either way.
    keypair = generate_wallet_keypair()

    for wallet_id in ("wallet_000001", "wallet_owner"):
        raw = "3.1415926535"
        rounded = round_wallet_balance(raw, 6)
        record = encrypt_balance_record(
            keypair.encapsulation_key, wallet_id, raw, rounded, decimals=6
        )
        recovered = decrypt_balance_record(keypair.decapsulation_key, record)
        print(wallet_id, "->", recovered, "| stored ciphertext bytes:",
              len(record["ciphertext"]) // 2)
