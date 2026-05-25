const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = {
  'docker-compose.yml': `
version: "3.9"
services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/pirc
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pirc
    ports:
      - "5432:5432"
  ipfs:
    image: ipfs/kubo:latest
    ports:
      - "5001:5001"
      - "8080:8080"
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
`,
  'server/Dockerfile': `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
`,
  'server/package.json': `
{
  "name": "pirc-server",
  "type": "module",
  "dependencies": {
    "express": "^4.21.2"
  }
}
`,
  'server/app.js': `
import express from "express";
import { inheritanceEngine } from "../core/inheritance/fullEngine.js";
import { calculateAdvancedZakat } from "../core/zakat/advancedZakat.js";
import { validate } from "../middleware/validate.js";

const app = express();
app.use(express.json());

app.post("/inheritance", validate, (req, res) => {
  try {
    const result = inheritanceEngine(req.body);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/zakat", validate, (req, res) => {
  try {
    const zakat = calculateAdvancedZakat(req.body);
    res.json({ zakat });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
`,
  'middleware/validate.js': `
export function validate(req, res, next) {
  if (!req.body) {
    return res.status(400).json({ error: "Invalid input" });
  }
  next();
}
`,
  'core/inheritance/fullEngine.js': `
import { calculateIslamicFull } from "./islamicEngine.js";

export function inheritanceEngine(data) {
  const { religion } = data;
  switch (religion) {
    case "islam":
      return calculateIslamicFull(data);
    case "christianity":
      return equalDistribution(data);
    case "judaism":
      return jewishPriorityDistribution(data);
    default:
      return equalDistribution(data);
  }
}

function equalDistribution(data) {
  const { estate, heirs } = data;
  if (!heirs || heirs.length === 0) return [];
  const share = estate / heirs.length;
  return heirs.map(h => ({ ...h, share }));
}

function jewishPriorityDistribution(data) {
  return equalDistribution(data);
}
`,
  'core/inheritance/islamicEngine.js': `
export function calculateIslamicFull(data) {
  const { estate, heirs } = data;
  let remaining = estate;
  let result = [];

  const hasSon = heirs.some(h => h.type === "son");

  const wife = heirs.find(h => h.type === "wife");
  if (wife) {
    let share = hasSon ? estate * (1/8) : estate * (1/4);
    result.push({ ...wife, share });
    remaining -= share;
  }

  const mother = heirs.find(h => h.type === "mother");
  if (mother) {
    let share = estate * (1/6);
    result.push({ ...mother, share });
    remaining -= share;
  }

  const father = heirs.find(h => h.type === "father");
  if (father) {
    result.push({ ...father, share: remaining });
    remaining = 0;
  }

  const children = heirs.filter(h => h.type === "son" || h.type === "daughter");
  if (children.length > 0) {
    let totalWeight = children.reduce((sum, c) => sum + (c.type === "son" ? 2 : 1), 0);
    children.forEach(c => {
      let weight = c.type === "son" ? 2 : 1;
      let share = (remaining * weight) / totalWeight;
      result.push({ ...c, share });
    });
    remaining = 0;
  }

  if (hasSon) {
    result = result.filter(h => !["brother", "uncle"].includes(h.type));
  }
  return result;
}
`,
  'core/divorce/divorceEngine.js': `
export function divorceEngine(data) {
  const { assets, religion } = data;
  if (religion === "islam") {
    return islamicDivorce(data);
  }
  return equalSplit(assets);
}

function islamicDivorce(data) {
  const { assets, mahrPaid } = data;
  return {
    wife: mahrPaid ? assets * 0.5 : assets * 0.6,
    husband: mahrPaid ? assets * 0.5 : assets * 0.4
  };
}

function equalSplit(assets) {
  return { wife: assets * 0.5, husband: assets * 0.5 };
}
`,
  'core/zakat/advancedZakat.js': `
export function calculateAdvancedZakat(data) {
  const { cash, gold, investments, debts } = data;
  let total = cash + gold + investments - debts;
  if (total <= 0) return 0;
  return total * 0.025;
}
`,
  'core/assets/minorVault.js': `
export function createMinorVault(user) {
  return { owner: user, locked: true, unlockAge: 18, rewards: "active" };
}
`,
  'core/identity/voiceAuth.js': `
export function authorizeVoicePayment(voiceHash, storedHash) {
  return voiceHash === storedHash;
}
`,
  'core/governance/fullGovernance.js': `
export function governanceDecision(caseData) {
  return { votes: [], requiredConsensus: 0.75, status: "pending", finalDecision: null };
}
`,
  'core/assets/recovery.js': `
export function recoverFunds(caseData) {
  return { action: "reverse", freezeDuration: "6 months", audit: true };
}
`,
  'matrix/decision_matrix/engine.js': `
export function decisionMatrix(inputs) {
  return inputs.map(i => ({ ...i, weight: i.priority * i.trustScore }));
}
`,
  'geometry/distribution_models/advanced.js': `
export function normalizeDistribution(values) {
  const total = values.reduce((a,b)=>a+b,0);
  return values.map(v => v / total);
}
`,
  'raw/immutable_records/chain.js': `
export function createAuditChain(records) {
  return records.map((r, i) => ({ ...r, index: i, prevHash: i > 0 ? records[i-1].hash : null }));
}
`,
  'quantum/zk_proofs/proof.js': `
import { quantumSafeHash } from "../crypto_layer/hash.js";
export function generateProof(data) {
  return { hash: quantumSafeHash(data), proof: "zk-proof-placeholder" };
}
`,
  'quantum/crypto_layer/hash.js': `
import crypto from "crypto";
export function quantumSafeHash(data) {
  return crypto.createHash("sha3-512").update(JSON.stringify(data)).digest("hex");
}
`,
  'contracts/factory/contractFactory.js': `
export function generateInheritanceContract(distribution) {
  return { type: "Inheritance", payload: distribution, timestamp: Date.now() };
}
`,
  'contracts/Inheritance.sol': `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Inheritance {
    struct Heir {
        address wallet;
        uint256 share;
    }
    Heir[] public heirs;

    constructor(address[] memory wallets, uint256[] memory shares) payable {
        require(wallets.length == shares.length, "Mismatch");
        for (uint i = 0; i < wallets.length; i++) {
            heirs.push(Heir(wallets[i], shares[i]));
        }
    }

    function distribute() public {
        for (uint i = 0; i < heirs.length; i++) {
            payable(heirs[i].wallet).transfer(heirs[i].share);
        }
    }

    receive() external payable {}
}
`,
  'contracts/deploy.js': `
import { ethers } from "ethers";

export async function deployContract(abi, bytecode) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  return contract.target;
}
`,
  '.github/workflows/unified.yml': `
name: PiRC Unified System

on:
  push:
    branches:
      - divine_justice
      - feature/**
      - contract/**
      - audit/**

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Structure
        run: |
          test -d core || exit 1
          test -d contracts || exit 1
          test -d docs || exit 1
`,
  'docs/divine_justice/WHITEPAPER.md': `
# PiRC Divine Justice System (DJS)

## 1. Introduction
The Divine Justice System (DJS) is a multi-layered computational and governance framework designed to ensure fair, transparent, and verifiable distribution of financial assets, inheritance, and obligations.

It integrates:
- deterministic legal/religious logic
- governance-based validation
- smart contract execution
- cryptographic auditability

## 2. Architecture
The system operates across 7 layers:
1. Identity Layer (KYC, biometrics, voice fallback)
2. Asset Layer (wallet + real-world aggregation)
3. Debt Layer (priority settlement)
4. Religion Layer (rulepacks)
5. Governance Layer (review + voting)
6. Execution Layer (smart contracts)
7. Audit Layer (cryptographic + immutable records)
`,
  'docs/divine_justice/master_index.md': `
# Divine Justice System — Master Index
## Core Layers (7 Layers Model)
1. Identity Layer
2. Asset Layer
3. Debt Layer
4. Religion Rule Layer
5. Governance Layer
6. Execution Layer (Smart Contracts)
7. Audit + Quantum Proof Layer

## Standards Coverage
- PiRC-45 → Core Engine
- PiRC-46 → Debt
- PiRC-47 → Theft Recovery
- PiRC-48 → Identity
- PiRC-49 → Inheritance
- PiRC-50 → Religion Engine
- PiRC-51 → Divorce
- PiRC-52 → Zakat
`,
  'frontend/src/App.jsx': `
import { useState } from "react";

export default function App() {
  const [result, setResult] = useState(null);

  const calculate = async () => {
    try {
      const res = await fetch("http://localhost:3000/inheritance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          religion: "islam",
          estate: 1000,
          heirs: [
            { type: "wife" },
            { type: "son" },
            { type: "daughter" }
          ]
        })
      });
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateZakat = async () => {
    try {
      const res = await fetch("http://localhost:3000/zakat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cash: 1000, gold: 500, investments: 300, debts: 100 })
      });
      const data = await res.json();
      alert("Zakat: " + data.zakat);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Divine Justice Dashboard</h1>
      <button onClick={calculate} style={{marginRight: 10}}>Calculate Inheritance</button>
      <button onClick={calculateZakat}>Calculate Zakat</button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
`,
  'frontend/package.json': `
{
  "name": "divine-justice-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0"
  }
}
`,
  'frontend/vite.config.js': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`,
  'frontend/index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Divine Justice Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  'frontend/src/main.jsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`
};

const repoDir = path.join(process.cwd(), 'divine_justice_repo');
if (!fs.existsSync(repoDir)) {
  fs.mkdirSync(repoDir);
}

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(repoDir, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n');
}

execSync('cd divine_justice_repo && zip -r ../divine_justice.zip .');
console.log('Zip file created successfully at divine_justice.zip');
