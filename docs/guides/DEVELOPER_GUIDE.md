# PiRC Developer Integration Guide (vFinal)

This guide describes how to verify and integrate against the PiRC Sovereign Architecture on Pi Testnet.

## Public on-chain identifiers

| Role | Address | Network |
|------|---------|---------|
| Master Issuer (7 Project Packets) | `GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6` | Pi Testnet (Stellar) |
| PiRC2 Subscription Contract | `CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV` | Pi Testnet (Soroban) |

Both are public — safe to commit, log, and link. Secret keys must come from `.env` (see `.env.example`) and are never read by the orchestrator helpers.

## The 7 colored Project Packets

`7_layer_packets.json` is the authoritative registry. The dashboard, the `/api/status` endpoint, and the Python orchestrator all read from the same set of contract IDs.

## Verifying live status

```bash
# Read-only public reads against Horizon + Soroban RPC. Exits non-zero on failure.
./activate_pirc_full_final.sh

# Or just the JSON status payload:
python3 pi_rc_master_orchestrator_final.py status
```

In the browser, open `/` and inspect the three tiles below the header (issuer sequence, subscription network, latest ledger). The tiles are populated by `/api/status`, which is implemented by `netlify/functions/status.js` and reads only public chain data.

## Subscribing via PiRC2

The recurring-payment flow uses the Soroban `do_approve` allowance pattern so subscribers do not re-sign each charge. Documentation of the lifecycle, error codes, query methods, and admin methods lives in `PiRC2/` (files `1-introduction.md` through `9-subscription-setup-guide.md`).

To invoke the subscription contract from the Soroban CLI:

```bash
soroban contract invoke \
  --id CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- <method> <args...>
```

`<method>` should be one of those documented in `PiRC2/8-admin-methods.md` and `PiRC2/7-query-methods.md`.

## CI / GitHub Actions

The vFinal orchestrator is read-only by design. CI may run `python3 pi_rc_master_orchestrator_final.py status` to gate deploys on issuer reachability and Soroban RPC health. CI must not be granted the issuer's secret seed.

## Out of scope

This guide deliberately does not document an "auto-merge any branch" flow, an autonomous PR-creation bot, or a self-healing rewriter. Those patterns are unsafe to run inside automated agents against a production-bound repository and have been removed from the vFinal scope.
