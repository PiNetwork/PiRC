# PiRC System Status — vFinal

**Network:** Pi Testnet (Soroban / Stellar)
**Master Issuer (7-Layer Project Packets):** `GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6`
**PiRC2 Subscription Contract:** `CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV`
**Public Horizon:** `https://api.testnet.minepi.com`
**Soroban RPC:** `https://soroban-testnet.stellar.org:443`

## Live monitoring

The dashboard at `/` polls `/api/status` (Netlify Function `netlify/functions/status.js`) every 30s and renders three live tiles:

- Master Issuer · current Horizon sequence
- PiRC2 Subscription Contract · network passphrase
- Soroban latest ledger · plus env-wiring flags (`STELLAR_TESTNET_SECRET`, `PI_API_KEY`, `OMNI_SYNC_TOKEN`) shown only as set/missing — values are never returned.

## 7 colored Project Packets

The authoritative metadata lives in `7_layer_packets.json` and is referenced by `CONTRACTS_REGISTRY.json` under the new `core` block. Both files use the same issuer and the same seven contract IDs the dashboard renders.

| Color  | Role        | Contract |
|--------|-------------|----------|
| RED    | Governance  | `CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO` |
| GREEN  | Pi Cash     | `CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4` |
| ORANGE | Register    | `CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF` |
| YELLOW | Subscribe   | `CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF` |
| BLUE   | Extend      | `CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD` |
| PURPLE | Pay Upfront | `CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4` |
| GOLD   | Status      | `CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG` |

## Verifying status from a shell

```
./activate_pirc_full_final.sh
# or
python3 pi_rc_master_orchestrator_final.py status
```

Both commands are read-only against public endpoints. Exits non-zero on failed checks so CI can gate on it.

## Out of scope (deliberately)

The vFinal orchestrator does not implement: autonomous PR creation, branch auto-merge, "self-healing" file rewrites, mainnet writes, or any operation that would consume `STELLAR_TESTNET_SECRET` from CI. Those flows must remain operator-driven.
