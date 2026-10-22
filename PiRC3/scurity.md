# Security Policy — PiRC3

## Scope

This policy covers the PiRC3 repository, including the data layer (allocation schema), the allocation engine, and the stablecoin mechanism module.

## Supported versions

| Component | Status |
|---|---|
| `pirc3-allocation-schema.json` | Draft — not yet production-reviewed |
| `pirc3-allocation-engine.js` | Draft — not yet production-reviewed |
| `pirc3-stablecoin-mechanism.js` | Draft — not yet production-reviewed |

None of the components in this repository have had an independent security audit. Do not use them to custody or move real funds until they have.

## Reporting a vulnerability

- **Do not open a public GitHub issue for security vulnerabilities.**
- Email the maintainer(s) at: `security@REPLACE-WITH-YOUR-DOMAIN` (replace before publishing — a placeholder here is not a working contact).
- Include: a description of the issue, steps to reproduce, and the potential impact.
- You can expect an acknowledgment within a timeframe you define here (e.g. 72 hours) while the report is triaged.

## Known risk areas to disclose against

- **Reserve/custody risk** — anything touching `ReserveLedger` or reserve valuation in the stablecoin mechanism.
- **Mint/redeem authorization** — any path that allows minting or redeeming without proper `approvedBy` checks.
- **Peg manipulation** — ways `checkPeg` inputs could be spoofed or delayed to hide a real peg break.
- **Schema bypass** — allocation data that doesn't conform to `pirc3-allocation-schema.json` but is still accepted by the engine.
- **Dependency risk** — if a JSON Schema validator (e.g. `ajv`) or other third-party package is added, keep it pinned and monitored for advisories.

## Before any production deployment

- Replace all placeholder values (collateralization ratio, peg target, custodian, fees) with reviewed real values.
- Run a full validation pass with a proper JSON Schema validator, not the hand-rolled checks in the draft engine.
- Get an independent code/security review of the mint, redeem, and reserve-tracking logic.
- Confirm the regulatory status of operating a stablecoin in your jurisdiction(s) before launch.
