t.com)

:::writing{variant="document" id="83519" title="security.py"}
"""
Payment Security Module

Path:
website/app/[lang]/@pibrowser/payment/security.py

Security utilities for payment validation.

This module does NOT store private keys, seed phrases, passwords,
or other long-lived secrets.
"""

from future import annotations

import hashlib
import hmac
import time
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation


MAX_AMOUNT = Decimal("1000000")
DEFAULT_EXPIRY_SECONDS = 300


class SecurityError(Exception):
    """Base exception for payment security failures."""


class InvalidPayment(SecurityError):
    """Raised when payment data is invalid."""


class ReplayDetected(SecurityError):
    """Raised when a payment nonce has already been used."""


@dataclass(frozen=True)
class PaymentRequest:
    payment_id: str
    sender: str
    recipient: str
    amount: str
    asset: str
    network: str
    nonce: str
    timestamp: int
    expires_at: int


def validate_amount(amount: str) -> Decimal:
    """Validate and normalize a payment amount."""

    try:
        value = Decimal(amount)
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise InvalidPayment("Invalid payment amount") from exc

    if not value.is_finite():
        raise InvalidPayment("Amount must be finite")

    if value <= 0:
        raise InvalidPayment("Amount must be greater than zero")

    if value > MAX_AMOUNT:
        raise InvalidPayment("Amount exceeds configured limit")

    return value


def validate_request(
    request: PaymentRequest,
    now: int | None = None,
) -> bool:
    """Validate basic payment request integrity."""

    current_time = int(time.time()) if now is None else now

    required = (
        request.payment_id,
        request.sender,
        request.recipient,
        request.asset,
        request.network,
        request.nonce,
    )

    if any(not isinstance(value, str) or not value.strip() for value in required):
        raise InvalidPayment("Required payment fields are missing")

    validate_amount(request.amount)

    if request.expires_at <= request.timestamp:
        raise InvalidPayment("Invalid payment expiration")

    if current_time > request.expires_at:
        raise InvalidPayment("Payment request has expired")

    return True


def payment_fingerprint(request: PaymentRequest) -> str:
    """
    Generate a deterministic fingerprint for audit/deduplication.

    This is not a digital signature and must not be treated as one.
    """

    payload = "|".join(
        (
            request.payment_id,
            request.sender,
            request.recipient,
            request.amount,
            request.asset,
            request.network,
            request.nonce,
            str(request.timestamp),
            str(request.expires_at),
        )
    )

    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def verify_digest(
    expected: str,
    actual: str,
) -> bool:
    """Constant-time comparison for previously calculated digests."""

    if not expected or not actual:
        return False

    return hmac.compare_digest(expected, actual)


class ReplayGuard:
    """
    Minimal in-memory replay guard.

    Production deployments should use a shared durable store with
    atomic nonce insertion/expiration semantics.
    """

    def init(self) -> None:
        self._used: dict[str, int] = {}

    def check_and_use(
        self,
        nonce: str,
        expires_at: int,
        now: int | None = None,
    ) -> bool:
        current_time = int(time.time()) if now is None else now

        self._cleanup(current_time)

        if nonce in self._used:
            raise ReplayDetected("Payment nonce has already been used")

        self._used[nonce] = expires_at
        return True

    def _cleanup(self, now: int) -> None:
        expired = [
            nonce
            for nonce, expires_at in self._used.items()
            if expires_at < now
        ]

        for nonce in expired:
            del self._used[nonce]


def security_check(
    request: PaymentRequest,
    replay_guard: ReplayGuard,
    now: int | None = None,
) -> str:
    """
    Validate a payment before processing.

    Returns a SHA-256 fingerprint suitable for audit/deduplication.
    """

    validate_request(request, now=now)
    replay_guard.check_and_use(
        request.nonce,
        request.expire
