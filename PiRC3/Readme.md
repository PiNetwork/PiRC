# PiRC3

Design-stage implementation of the PiRC3 allocation system and stablecoin mechanism: a data layer (schema), an allocation engine, a stablecoin module, and validation tooling.

> **Status: draft / design stage.** No component here has had an independent security audit. Do not use this to custody or move real funds, and do not treat the placeholder values (collateralization ratio, peg target, fees, etc.) as real defaults — set them deliberately and get them reviewed.

## Structure

```
.
├── pirc3-allocation-schema.json    # Data layer: JSON Schema for allocation params, token/Pi splits
├── pirc3-allocation-engine.js      # Allocation engine: pool sizing, price curve, participant allocation
├── pirc3-stablecoin-mechanism.js   # Stablecoin mechanism: reserve ledger, mint/redeem, peg monitoring
├── pirc3_validate.py               # Python validation script (independent sanity check on config data)
├── PiRC3-stablecoin-mechanism.md   # Design doc: stablecoin mechanism explanation and open questions
├── LICENSE.txt                     # MIT license
└── SECURITY.md                     # Security policy and disclosure process
```

## System overview

```
Inputs → Data layer (schema) → Allocation engine → Stablecoin mechanism → Docs/reports
```

- **Data layer** (`pirc3-allocation-schema.json`) defines the shape of allocation config: total supply, token splits, Pi/reserve-asset splits, pool parameters, and participant tiers.
- **Allocation engine** (`pirc3-allocation-engine.js`) consumes a config matching that schema and computes pool parameters, an effective price curve, and per-participant allocations with tier-based discounts.
- **Stablecoin mechanism** (`pirc3-stablecoin-mechanism.js`) tracks reserve deposits, mints and redeems against a minimum collateralization ratio, monitors peg deviation, and keeps a full audit trail.
- **Validation** (`pirc3_validate.py`) is a Python script that independently sanity-checks an allocation config and a stablecoin parameter set — useful in CI, since it's implemented separately from the JS engine and will catch things a single implementation might not.

## Quick start

**Node (allocation engine / stablecoin mechanism):**
```bash
node pirc3-allocation-engine.js        # runs the built-in demo
node pirc3-stablecoin-mechanism.js     # runs the built-in demo
```

**Python (validation):**
```bash
python3 pirc3_validate.py --demo               # validate the built-in demo config
python3 pirc3_validate.py path/to/config.json  # validate your own config file
```

Both engine files also export their classes (`PiRCAllocationEngine`, `ReserveLedger`, `StablecoinMechanism`) via `module.exports` for use in a larger application.

## Before using this for anything real

1. Replace every placeholder value: peg target, minimum collateralization ratio, reserve asset, fees, custodian.
2. Swap the hand-rolled config checks in `pirc3-allocation-engine.js` for a real JSON Schema validator (e.g. `ajv`) against `pirc3-allocation-schema.json`.
3. Get an independent security review of the mint/redeem/reserve logic — see `SECURITY.md`.
4. Confirm the regulatory status of operating a stablecoin in your relevant jurisdiction(s).

## License

MIT — see `LICENSE.txt`.

## Security

See `SECURITY.md` for the disclosure policy and known risk areas. Please do not open public issues for security vulnerabilities.
