# 🛠️ PiRC Developer Integration Guide (V19)

Welcome Pioneer. To integrate your app into the Sovereign System:

### 1. Auto-Import Merchandise
Call the `rwa_garden` contract using your App-ID. The system will automatically tokenize your items as RWAs.

### 2. Claim Your 5000 Token Reward
Once your app is registered, the system triggers an automatic airdrop of **5000 tokens from all 7 layers** to your liquidity pool.

### 3. Payment Gateway & Compliance
Whether your customers pay via **Visa** or **Sovereign Tokens**, the system automatically swaps them for your App-Native Token.
* **AML Tracking:** Every transaction logs the Source, Product Type, and Day/Time for maximum transparency and trust.

---

## 🚀 Post-Deployment & Operations (Live Network)

### 1. Generating System Verification Report
Run this script and read `PI_RC_VERIFICATION_REPORT.txt`:
```bash
./scripts/generate_verification_report.sh
```

### 2. Manual Soroban CLI Interactions
To interact with deployed PiRC contracts directly via terminal:

**Minting an RWA Token (Example PiRC-105 equivalent):**
```bash
soroban contract invoke   --id <YOUR_CONTRACT_ID>   --source <YOUR_SECRET_KEY>   --network testnet   -- mint --to <RECIPIENT_ADDRESS> --amount 10000000
```

**Check Token Balance:**
```bash
soroban contract invoke   --id <YOUR_CONTRACT_ID>   --source <YOUR_SECRET_KEY>   --network testnet   -- balance --id <TARGET_ADDRESS>
```

### 3. Running Production via Docker Compose
For isolation or running on a cloud VPS (AWS, DigitalOcean):
```bash
docker-compose up -d --build
```
This will instantly spin up your Rust compiler environment, Python Quantum Simulators, and Frontend interface.

### 4. CI/CD (GitHub Actions)
Every push to the `main` branch will now automatically trigger a build phase on GitHub's cloud, compiling all contracts to WASM and executing the Python topological models to ensure code integrity.
