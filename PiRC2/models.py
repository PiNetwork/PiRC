"""
PiRC2 Indexer Database — SQLAlchemy models (schema v2)

Mirrors pirc2/schema.sql. Connection layer uses a pooled engine with
tenacity-based retry + a simple circuit breaker around transient
Postgres errors, matching the pattern used across Tsuki's other
Pi Network indexer/DB projects.

Install:
    pip install "sqlalchemy>=2.0" psycopg[binary] tenacity

Env vars:
    PIRC2_DB_DSN   postgresql+psycopg://user:pass@host:5432/pirc2
"""

from __future__ import annotations

import enum
import logging
import os
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Generator, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    create_engine,
    text,
)
from sqlalchemy.exc import DBAPIError, OperationalError
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)
from sqlalchemy.dialects.postgresql import JSONB
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger("pirc2.db")


# ---------------------------------------------------------------------------
# Declarative base / schema
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


class EventType(str, enum.Enum):
    srv_reg = "srv_reg"
    sub = "sub"
    approve = "approve"
    cancel = "cancel"
    renew = "renew"
    extend = "extend"
    charge = "charge"
    trl_end = "trl_end"
    low_alw = "low_alw"
    low_bal = "low_bal"
    chg_fail = "chg_fail"
    upgrade = "upgrade"


class ErrorCode(str, enum.Enum):
    InvalidPrice = "InvalidPrice"
    InvalidPeriod = "InvalidPeriod"
    AlreadySubscribed = "AlreadySubscribed"
    SubscriptionNotFound = "SubscriptionNotFound"
    ServiceNotFound = "ServiceNotFound"
    Unauthorized = "Unauthorized"
    AlreadyCancelled = "AlreadyCancelled"
    TimestampOverflow = "TimestampOverflow"
    NotServiceOwner = "NotServiceOwner"
    InvalidServiceName = "InvalidServiceName"
    SubscriptionExpired = "SubscriptionExpired"


class Service(Base):
    __tablename__ = "services"
    __table_args__ = (
        CheckConstraint("price > 0", name="chk_services_price_positive"),
        CheckConstraint("period_secs > 0", name="chk_services_period_positive"),
        CheckConstraint("approve_periods > 0", name="chk_services_approve_periods_positive"),
        {"schema": "pirc2"},
    )

    service_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    merchant: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[int] = mapped_column(Numeric(38, 0), nullable=False)
    period_secs: Mapped[int] = mapped_column(BigInteger, nullable=False)
    trial_period_secs: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    approve_periods: Mapped[int] = mapped_column(BigInteger, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[int] = mapped_column(BigInteger, nullable=False)

    subscriptions: Mapped[list["Subscription"]] = relationship(
        back_populates="service", cascade="all, delete-orphan", passive_deletes=True
    )

    def is_currently_active(self) -> bool:
        return self.is_active


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = (
        UniqueConstraint("subscriber", "service_id", name="uq_active_sub_service"),
        CheckConstraint("price > 0", name="chk_subs_price_positive"),
        CheckConstraint("period_secs > 0", name="chk_subs_period_positive"),
        {"schema": "pirc2"},
    )

    sub_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    subscriber: Mapped[str] = mapped_column(String, nullable=False, index=True)
    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("pirc2.services.service_id", ondelete="RESTRICT"), nullable=False
    )
    price: Mapped[int] = mapped_column(Numeric(38, 0), nullable=False)
    period_secs: Mapped[int] = mapped_column(BigInteger, nullable=False)
    trial_period_secs: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    trial_end_ts: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    pay_upfront: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    service_end_ts: Mapped[int] = mapped_column(BigInteger, nullable=False)
    next_charge_ts: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[int] = mapped_column(BigInteger, nullable=False)
    used_trial: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    service: Mapped["Service"] = relationship(back_populates="subscriptions")

    def is_active_now(self, now_ts: Optional[int] = None) -> bool:
        now_ts = now_ts or int(time.time())
        return now_ts < self.service_end_ts

    def is_due(self, now_ts: Optional[int] = None) -> bool:
        now_ts = now_ts or int(time.time())
        return self.pay_upfront and now_ts >= self.next_charge_ts

    def advance_no_drift(self) -> None:
        """Mirror the contract's no-drift rule: step forward from the
        previous next_charge_ts, never from wall-clock time."""
        self.next_charge_ts += self.period_secs
        self.service_end_ts = self.next_charge_ts


class ContractEvent(Base):
    __tablename__ = "contract_events"
    __table_args__ = (
        UniqueConstraint("tx_hash", "event_index", name="uq_event_position"),
        {"schema": "pirc2"},
    )

    event_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    event_type: Mapped[EventType] = mapped_column(
        Enum(EventType, name="event_type", schema="pirc2", native_enum=True), nullable=False
    )
    ledger_seq: Mapped[int] = mapped_column(BigInteger, nullable=False)
    tx_hash: Mapped[str] = mapped_column(String, nullable=False)
    event_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    service_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("pirc2.services.service_id", ondelete="SET NULL")
    )
    sub_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("pirc2.subscriptions.sub_id", ondelete="SET NULL")
    )
    actor: Mapped[Optional[str]] = mapped_column(String)
    amount: Mapped[Optional[int]] = mapped_column(Numeric(38, 0))
    error_code: Mapped[Optional[ErrorCode]] = mapped_column(
        Enum(ErrorCode, name="error_code", schema="pirc2", native_enum=True)
    )
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    occurred_at: Mapped[int] = mapped_column(BigInteger, nullable=False)


class ProcessBatch(Base):
    __tablename__ = "process_batches"
    __table_args__ = {"schema": "pirc2"}

    batch_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("pirc2.services.service_id"), nullable=False
    )
    merchant: Mapped[str] = mapped_column(String, nullable=False)
    tx_hash: Mapped[str] = mapped_column(String, nullable=False)
    offset_arg: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    limit_arg: Mapped[int] = mapped_column(BigInteger, nullable=False)
    charged: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    skipped: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ledger_seq: Mapped[int] = mapped_column(BigInteger, nullable=False)
    occurred_at: Mapped[int] = mapped_column(BigInteger, nullable=False)


# ---------------------------------------------------------------------------
# Pooled engine + retry / circuit breaker
# ---------------------------------------------------------------------------
class CircuitOpenError(RuntimeError):
    """Raised instead of hitting the DB while the breaker is open."""


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_after_secs: float = 30.0):
        self.failure_threshold = failure_threshold
        self.reset_after_secs = reset_after_secs
        self._failures = 0
        self._opened_at: Optional[float] = None

    @property
    def is_open(self) -> bool:
        if self._opened_at is None:
            return False
        if time.monotonic() - self._opened_at >= self.reset_after_secs:
            # half-open: allow a trial request through
            self._opened_at = None
            self._failures = 0
            return False
        return True

    def record_success(self) -> None:
        self._failures = 0
        self._opened_at = None

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures >= self.failure_threshold and self._opened_at is None:
            self._opened_at = time.monotonic()
            logger.warning("pirc2 db circuit breaker OPEN after %s failures", self._failures)


_breaker = CircuitBreaker()


def build_engine(dsn: Optional[str] = None):
    dsn = dsn or os.environ.get(
        "PIRC2_DB_DSN", "postgresql+psycopg://pirc2:pirc2@localhost:5432/pirc2"
    )
    return create_engine(
        dsn,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,     # recycle connections every 30 min
        pool_pre_ping=True,    # avoid stale-connection errors
        future=True,
    )


engine = build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)


@retry(
    reraise=True,
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=8),
    retry=retry_if_exception_type((OperationalError, DBAPIError)),
)
def _connect_with_retry():
    if _breaker.is_open:
        raise CircuitOpenError("pirc2 db circuit breaker is open — skipping connect attempt")
    conn = engine.connect()
    _breaker.record_success()
    return conn


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Session-scoped unit of work with retrying connect + breaker guard.

    Usage:
        with get_session() as session:
            session.add(Service(...))
    """
    try:
        conn = _connect_with_retry()
    except (OperationalError, DBAPIError):
        _breaker.record_failure()
        raise

    session = Session(bind=conn, autoflush=False, expire_on_commit=False)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
        conn.close()


def healthcheck() -> bool:
    try:
        with get_session() as session:
            session.execute(text("SELECT 1"))
        return True
    except Exception as exc:  # noqa: BLE001 — healthcheck reports, doesn't raise
        logger.error("pirc2 db healthcheck failed: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Common queries
# ---------------------------------------------------------------------------
def get_due_subscriptions(session: Session, service_id: int, now_ts: Optional[int] = None):
    now_ts = now_ts or int(datetime.now(timezone.utc).timestamp())
    return (
        session.query(Subscription)
        .filter(
            Subscription.service_id == service_id,
            Subscription.pay_upfront.is_(True),
            Subscription.next_charge_ts <= now_ts,
        )
        .all()
    )


def get_merchant_services(session: Session, merchant: str):
    return session.query(Service).filter(Service.merchant == merchant).all()


def get_subscriber_subs(session: Session, subscriber: str):
    return session.query(Subscription).filter(Subscription.subscriber == subscriber).all()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ok = healthcheck()
    print(f"pirc2 db healthcheck: {'OK' if ok else 'FAILED'}")
