# PiRC3 Section 9: Error Codes

## Format: MMMEEE

MMM = Module (ESC, REP, DIS, MER, LOY, COO)
EEE = Error number (001-999)

## Escrow Errors (ESC)

| Code | Message | Description |
|------|---------|-------------|
| ESC001 | Not buyer | Caller is not the buyer |
| ESC002 | Not seller | Caller is not the seller |
| ESC003 | Not Created | Escrow not in Created state |
| ESC004 | Not Funded | Escrow not in Funded state |
| ESC005 | Not Delivered | Escrow not in Delivered state |
| ESC006 | Not Disputed | Escrow not in Disputed state |
| ESC007 | Amount zero | Escrow amount cannot be zero |
| ESC008 | Deadline past | Deadline already passed |
| ESC009 | Buyer seller same | Buyer and seller cannot be same |
| ESC010 | Timeout min 1d | Auto-release timeout minimum 1 day |
| ESC011 | Invalid percentage | Buyer percentage out of range |
| ESC012 | Cannot cancel | Cannot cancel in current state |
| ESC013 | Timeout not reached | Auto-release timeout not yet reached |
| ESC014 | Not expired | Delivery deadline not yet passed |
| ESC015 | Fee exceed max | Fee cannot exceed 10% |
| ESC016 | Already initialized | Contract already initialized |
| ESC017 | Protocol paused | Protocol is currently paused |
| ESC018 | Only coordinator | Only coordinator can call |

## Reputation Errors (REP)

| Code | Message | Description |
|------|---------|-------------|
| REP001 | Profile exists | Profile already created |
| REP002 | Only coordinator | Only coordinator can call |
| REP003 | Protocol paused | Protocol is currently paused |
| REP004 | Min Silver to attest | Minimum Silver tier to create attestation |
| REP005 | Cannot self-attest | Cannot attest for yourself |
| REP006 | Already revoked | Badge/attestation already revoked |

## Dispute Errors (DIS)

| Code | Message | Description |
|------|---------|-------------|
| DIS001 | Not evidence phase | Not in evidence submission phase |
| DIS002 | Deadline passed | Submission deadline passed |
| DIS003 | Not a party | Caller is not a party to the dispute |
| DIS004 | Evidence limit | Maximum 5 evidence items per party |
| DIS005 | Not voting phase | Not in voting phase |
| DIS006 | Not a juror | Caller is not a selected juror |
| DIS007 | Already committed | Juror already committed a vote |
| DIS008 | Not in reveal phase | Not in reveal phase |
| DIS009 | Already revealed | Vote already revealed |
| DIS010 | Not ruling phase | Not in ruling phase |
| DIS011 | No votes revealed | No votes have been revealed |
| DIS012 | Min Silver reputation | Minimum Silver reputation for juror |
| DIS013 | Min 10 Pi stake | Minimum 10 Pi stake for juror |
| DIS014 | Already registered | Juror already registered |
