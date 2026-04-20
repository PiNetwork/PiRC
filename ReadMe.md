 docs/official-submission
**# PiRC: Pi Requests for Comment**  
**Sovereign Monetary Standard & Long-Term Utility Economy Framework for the Pi Network**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  
[![Netlify Deploy](https://img.shields.io/badge/Deploy-Netlify-blue)](https://app.netlify.com)  
**Stars:** 6 | **Forks:** 2 | **Language Breakdown:** Python • Rust • HTML • JavaScript • Solidity

---

## 🌟 Overview

**PiRC** is a professional research and prototyping repository for modeling the **long-term utility-driven economy** of the Pi Network ecosystem.  

It combines:
- **Rust-based smart-contract prototypes** (liquidity bootstrap, reward engine, governance, treasury vaults, etc.)
- **Python economic simulation engines** (50-year macroeconomic models, AI-driven stabilizers, agent-based simulations)
- **A live simulated economic dashboard** (Vanguard Bridge – Weighted Contribution Factor telemetry)
- **Formal PiRC proposals** (PiRC-101 Sovereign Monetary Standard, adaptive allocation, engagement oracle, etc.)

The framework studies decentralized exchange liquidity, application growth, human-in-the-loop digital labor, and macroeconomic stability over decades while protecting pioneer contributions through the **Weighted Contribution Factor (WCF)** and **System Efficiency Factor (Φ)**.

**Core Thesis (PiRC-101):**  
Create a non-inflationary “Walled Garden” where external speculative IOU prices are decoupled from internal utility-backed Macro Pi, enforced by dynamic quadratic guardrails and Justice-Mined equity ($REF).

**Live Demo** (Netlify deployment): The repository is configured for instant deployment — the **index.html** interface functions as the official **Vanguard Bridge Dashboard** when served via Netlify.

---

## 📊 Core Indicators (Vanguard Bridge)
![1000097918](https://github.com/user-attachments/assets/2da73897-d73d-49c8-ae94-aa77d59b17ec)

PiRC Vanguard Bridge — NOW WITH REAL BUY/SELL DATA!

Live Order Book + Recent Trades from OKX (PI-USDT), MEXC (PIUSDT) & Kraken (PIUSD)
Professional Warehouse Mechanism — full transparency + formulas
Real-time indicators: Spread %, Mid Price, Buy/Sell Imbalance
All formulas displayed:
  Mid Price = (Best Bid + Best Ask) / 2
  Spread % = ((Best Ask - Best Bid) / Mid Price) × 100
  Buy Imbalance = Buy Volume / Total Volume × 100
  WCF Parity = Macro Pi × 10,000,000 × IOU Price

Live Demo (100% free, no registration):
https://c5d0b78a-8ece-460f-b8b4-64709c799a5e-00-3ag91petmaehl.pike.replit.dev

GitHub (full source + warehouse data):
https://github.com/Ze0ro99/PiRC

One click — everything works. Fully professional. Zero cost.

| Metric          | Description                                      | Purpose |
|-----------------|--------------------------------------------------|--------|
| **WCF**         | Weighted Contribution Factor                     | Protects long-term pioneers |
| **Φ (Phi)**     | System Efficiency Factor                         | Measures network liquidity health |
| **$REF**        | Circulating Pioneer Equity (Justice-Mined)       | Backed internal credit |
| **πUSD**        | Fixed Consensus Stability peg                    | Pegged at $3.14 |

**Micro-Pi Compression Logic**  
External CEX IOUs show raw Micro-Pi (1 Pi = 10,000,000 Micros).  
Internal ecosystem compresses to 1 Macro Pi → prevents hyper-inflation while maintaining utility parity.
This design allows for a better understanding of the mechanism for developers and pioneers, making it simpler both inside and outside the system. 
![1000098014](https://github.com/user-attachments/assets/460a53c7-422a-477c-b839-ebfa4d6f3b4d)

---

## 🗂 Repository Structure (Professional Organization)

```
PiRC/
├── index.html                  ← Vanguard Bridge Dashboard (fully functional on Netlify)
├── assets/js/
│   ├── constants.js
│   ├── calculations.js
│   └── explorer-core.js        ← Core logic: real-time ledger, multi-language (EN/AR/ZH/ID/FR/MS), WCF parity charts
├── netlify.toml                ← Zero-config deployment + API redirects
├── netlify/functions/          ← Serverless price/trade/orderbook endpoints
├── contracts/                  ← Rust + Solidity reference implementations
├── simulations/                ← Agent & liquidity stress tests (.py)
├── economics/                  ← Full AI economic models (pi_whitepaper_economic_model.py, RL governors, etc.)
├── docs/                       ← Whitepapers, architecture, merchant integration guides
├── scripts/ & automation/      ← Deployment & testing utilities
├── tests/ & security/          ← Unit tests + formal verification
├── diagrams/ & results/        ← Visual models & simulation outputs
├── .github/                    ← Workflows & issue templates
├── LICENSE, Dockerfile, .gitignore
└── PiRC-1xx/*.md               ← Official proposals (PiRC-101, PiRC-201, etc.)
```

**Note:** All Rust prototypes (`pi_token.rs`, `reward_engine.rs`, `liquidity_bootstrapper.rs`, etc.) and Python models are production-ready references. The repository follows clean separation of concerns for research, simulation, and deployment.

---

## 🚀 Quick Start & Usage

### 1. Web Dashboard (index.html) – Functions Correctly on Netlify
```bash
# Clone & deploy (one-click)
git clone https://github.com/Ze0ro99/PiRC.git
cd PiRC
# Push to your Netlify account or use the "Deploy to Netlify" button
```
- **Real-time telemetry** (WCF parity, $REF ledger, IOU vs Macro Pi charts)
- **Multi-language support** (English, Arabic, Chinese, Indonesian, French, Malay)
- **Live API integration** via Netlify Functions (`/api/prices`, `/api/trades`, `/api/orderbook`)

**Local preview** (after deployment or with any static server):
```bash
npx serve .
```
The interface loads `assets/js/explorer-core.js` automatically and renders the full Vanguard Bridge experience.

### 2. Run Economic Simulations (Python)
```bash
pip install numpy pandas matplotlib scipy  # (or use the included Dockerfile)
python economics/pi_whitepaper_economic_model.py
# or
python simulations/pirc_economic_simulation.py
```
Runs 50-year projections with AI adoption curves, liquidity stress tests, and equilibrium pricing.

### 3. Rust Contract Prototypes
```bash
cargo run --manifest-path contracts/Cargo.toml  # (when ported to full workspace)
```
Reference implementations for Soroban/Stellar or EVM sidechains (see `PiRC101Vault.sol` as economic reference model).

### 4. Dockerized Environment
```bash
docker build -t pirc .
docker run -p 8080:80 pirc
```

---

## 📖 Documentation & Proposals

- **docs/PiRC101_Whitepaper.md** – Full sovereign monetary standard
- **docs/QUICKSTART_FOR_PI_CORE_TEAM.md** – Core-team integration guide
- **docs/MERCHANT_INTEGRATION.md** – Walled-garden merchant onboarding
- **economics/economic_model.md** – Formal invariants and AI governor specs

All PiRC proposals are open for community review and formal submission.

---

## 🛠 Deployment (Netlify – Production Ready)

The `netlify.toml` ensures:
- Root publish directory = `.` (index.html is the entry point)
- Automatic function routing (`/api/*` → `netlify/functions/`)
- Security headers (X-Frame-Options: DENY, strict CORS, Referrer-Policy)

**One-click deploy** from GitHub → Netlify → live at your custom domain with zero downtime.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/pi-rc-xxx`)
3. Update documentation and add tests
4. Submit a Pull Request referencing the relevant PiRC proposal

We welcome:
- New simulation scenarios
- Rust/Soroban ports
- Additional language translations for the dashboard
- Formal security audits

---

## 📜 License

MIT License – see [LICENSE](LICENSE) file.  
All economic models and contract prototypes are provided for research and community use.

---

**Disclaimer**  
This is an independent research prototype within the PiRC ecosystem. All telemetry and simulations reflect conceptual mainnet parity metrics. It is **not** an official Pi Network product.

---

**Ready to explore the future of Pi utility economics?**  
Clone → Deploy → Simulate → Contribute.

**Vanguard Bridge is live. The Pi ecosystem’s long-term monetary standard starts here.**  

— Ze0ro99 & PiRC Community  
*Last updated: March 2026*

- [PiRC1: Pi Ecosystem Token Design](./PiRC1/ReadMe.md)
- [PiRC2: Subscription Contract API](./PiRC2/ReadMe.md)
main
