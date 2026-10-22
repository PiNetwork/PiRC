# PiRC3

Design-stage implementation of the PiRC3 allocation system and stablecoin
mechanism, now organized as a layered app with a REST API on top of the
original engine/mechanism logic.

> **Status: draft / design stage.** No component here has had an independent
> security audit. Do not use this to custody or move real funds, and do not
> treat the placeholder values (collateralization ratio, peg target, fees,
> etc.) as real defaults — set them deliberately and get them reviewed.

## Structure

```
.
├── app/                        # Entry point & Express bootstrap
│   ├── index.js                # `node app/index.js` — starts the HTTP server
│   └── app.js                  # Builds the Express app (routes + middleware), importable without binding a port
│
├── Api/                        # HTTP layer: routes + controllers
│   ├── routes/
│   │   ├── allocation.routes.js
│   │   └── stablecoin.routes.js
│   ├── controllers/
│   │   ├── allocation.controller.js
│   │   └── stablecoin.controller.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── init.py                   # (Python) Flask app factory/entry point — a second, smaller API
│   ├── health.py                  # (Python) GET /health
│   └── exchange.py                # (Python) /api/exchange/* — reads/writes the sqlite exchange log
│
├── service/                    # Business logic (framework-agnostic)
│   ├── allocationEngine.js      # PiRCAllocationEngine — pool sizing, price curve, participant allocation
│   ├── stablecoinMechanism.js   # ReserveLedger, StablecoinMechanism — mint/redeem/peg
│   └── pirc3_validate.py        # Independent Python sanity check on config data
│
├── database/                   # Data layer
│   ├── allocation-schema.json   # JSON Schema for allocation config
│   ├── exchange_schema.sql      # sqlite schema for the off-chain swap/liquidity log
│   ├── db.js                    # (Node) sqlite connection + run/all/get helpers
│   ├── repository.js            # (Node) in-memory store for allocation configs & stablecoin instances (see note below)
│   ├── config.py                 # (Python) DB path/schema path/pragmas — same PIRC3_DB_PATH env var as db.js
│   ├── init.py                   # (Python) connection + schema setup, equivalent to db.js's getDb()
│   └── main.py                   # (Python) CLI: init / seed-swap / list-swaps / list-liquidity / stats
│
├── Document.md                 # Design doc: stablecoin mechanism explanation and open questions
├── LICENSE.txt
├── SECURITY.md
└── package.json
```

## System overview

```
HTTP request → Api (routes/controllers) → service (engine/mechanism) → database (schema/repository) → response
```

- **app/** boots the process: builds the Express app and starts listening.
- **Api/** is the only layer that knows about HTTP — it parses requests,
  calls into `service/`, and shapes responses. No business logic lives here.
- **service/** is the original design-stage logic, unchanged in behavior:
  `PiRCAllocationEngine` (pool sizing, price curve, tiered participant
  allocation) and `StablecoinMechanism` / `ReserveLedger` (reserve intake,
  mint/redeem against a collateralization floor, peg monitoring, audit
  trail).
- **database/** holds the data layer: the JSON Schema allocation configs
  must conform to, the sqlite schema for the on-chain exchange log, and a
  small repository that keeps allocation configs and stablecoin instances
  addressable by id across requests.

> **Note on `database/repository.js`:** the original `StablecoinMechanism`
> and `PiRCAllocationEngine` classes are plain in-memory objects — they
> don't persist anywhere by design. The repository just keeps instances
> alive in process memory so the API can look them up by id between
> requests; it resets on restart. The sqlite file (`db.js` +
> `exchange_schema.sql`) is wired up separately for the off-chain swap log
> and isn't yet connected to the repository — that's the next real piece of
> persistence work before this goes anywhere near production.

## Quick start

```bash
npm install
npm start                 # starts the API on :3000 (PORT env var to override)
```

Or run the original standalone demos directly:
```bash
npm run demo:engine       # node service/allocationEngine.js
npm run demo:stablecoin   # node service/stablecoinMechanism.js
npm run validate          # python3 service/pirc3_validate.py --demo
```

### Database CLI (Python side)

`database/` now has a Python-side config/init/CLI, alongside the existing
Node `db.js`/`repository.js`. Both point at the same sqlite file
(`PIRC3_DB_PATH` env var, default `database/pirc3.db`) and the same
`exchange_schema.sql` — use whichever side fits the calling code.

```bash
npm run db:init                 # or: python3 database/main.py init
python3 database/main.py seed-swap \
  --tx-hash 0xabc... --log-index 0 --block-number 123 \
  --user 0xuser... --token-in 0xtoken... \
  --amount-in 1000 --amount-out 995 --exchange 0xexchange...
python3 database/main.py list-swaps --limit 10
npm run db:stats                # or: python3 database/main.py stats
```

### Python API (second, smaller API)

`Api/` now also has a small Flask API — `init.py` (app factory + entry
point), `health.py`, and `exchange.py`. It's a second, independent API
process, not a replacement for the Node one: it only covers the off-chain
exchange log (`exchange_swaps` / `exchange_liquidity_events`), nothing about
allocations or the stablecoin mechanism. It shares the same sqlite file as
`database/main.py` and `database/db.js` (same `PIRC3_DB_PATH`), so writes
from one are visible to the others immediately.

```bash
pip install -r requirements.txt
python3 Api/init.py             # dev server on :5000 (PY_API_PORT to override)
```

Endpoints (all under `/api/exchange` except `/health`):

| Method | Path                      | Body / query                                                                 |
|--------|---------------------------|-------------------------------------------------------------------------------|
| GET    | `/health`                 | —                                                                              |
| GET    | `/api/exchange/swaps`     | `?limit=20`                                                                    |
| POST   | `/api/exchange/swaps`     | `tx_hash, log_index, block_number, user_address, token_in, amount_in, amount_out, exchange_addr` |
| GET    | `/api/exchange/liquidity` | `?limit=20`                                                                    |
| POST   | `/api/exchange/liquidity` | `tx_hash, log_index, block_number, event_type ("added"\|"removed"), token_address, amount`, optional `recipient` |
| GET    | `/api/exchange/stats`     | — returns row counts for both tables                                          |

Both swap/liquidity inserts are `INSERT OR IGNORE` on `(tx_hash, log_index)`,
matching the unique constraint in `exchange_schema.sql` — re-posting the
same event returns `{"inserted": false, "reason": "duplicate (...)"}`
instead of erroring.

Since the Node API (`app/`, port 3000 by default) and this Flask API
(port 5000 by default) are separate processes, run them side by side
rather than instead of one another if you want both allocation/stablecoin
endpoints and exchange-log endpoints available over HTTP at once.

### API examples

Create an allocation config and get its pool summary:
```bash
curl -X POST localhost:3000/api/allocations \
  -H 'Content-Type: application/json' \
  -d '{
    "schemaVersion": "1.0.0",
    "allocationId": "demo-001",
    "totalSupply": 1000000,
    "tokenSplits": [
      {"category": "community", "percentage": 60},
      {"category": "team", "percentage": 20},
      {"category": "treasury", "percentage": 20}
    ],
    "piSplits": [
      {"category": "liquidity_pool", "percentage": 70},
      {"category": "reserve", "percentage": 30}
    ],
    "poolParameters": {"listingPrice": 0.1, "reserveRatio": 0.5, "swapFeeBps": 30},
    "participantTiers": [
      {"tierName": "bronze", "minScore": 0, "discountPercent": 0}
    ]
  }'
```

Create a stablecoin instance, deposit reserve, and mint:
```bash
curl -X POST localhost:3000/api/stablecoins \
  -H 'Content-Type: application/json' \
  -d '{"instanceId": "demo", "pegTarget": "1 USD", "minCollateralizationRatio": 1.2}'

curl -X POST localhost:3000/api/stablecoins/demo/deposits \
  -H 'Content-Type: application/json' \
  -d '{"asset": "USD", "amount": 120000, "custodyLocation": "placeholder-custodian"}'

curl -X POST localhost:3000/api/stablecoins/demo/mint \
  -H 'Content-Type: application/json' \
  -d '{"amount": 100000, "counterparty": "issuer", "approvedBy": "demo-admin"}'
```

## Before using this for anything real

1. Replace every placeholder value: peg target, minimum collateralization
   ratio, reserve asset, fees, custodian.
2. Swap the hand-rolled config checks in `service/allocationEngine.js` for a
   real JSON Schema validator (e.g. `ajv`) against
   `database/allocation-schema.json`.
3. Connect `database/repository.js` to real persistence (sqlite via
   `database/db.js`, or another store) — right now state is process-memory
   only and is lost on restart.
4. Add authentication/authorization to the `Api/` layer — there is none yet
   on either the Node routes or the Flask blueprints, and `mint`/`redeem`/
   deposit/swap-recording endpoints should not be open to anyone who can
   reach the server.
5. Get an independent security review of the mint/redeem/reserve logic —
   see `SECURITY.md`.
6. Confirm the regulatory status of operating a stablecoin in your relevant
   jurisdiction(s).

## License

MIT — see `LICENSE.txt`.

## Security

See `SECURITY.md` for the disclosure policy and known risk areas. Please do
not open public issues for security vulnerabilities.
