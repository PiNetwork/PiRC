import os
import subprocess
import time

# --- Configuration ---
BASE_BRANCH = "main"
SOURCE_BRANCH = "Backup-copy"
REMOTE_NAME = "origin"
EXECUTE = True 

PR_BATCHES = [
    {"branch": "feat/pirc-101-102-core", "title": "🏛️ PR 1: Core Foundation (101/102)", "body": "Core monetary supply mechanics.", "files": ["PiRC-101.md", "PiRC-102.md"]},
    {"branch": "feat/pirc-201-205-adaptive", "title": "📈 PR 2: Adaptive Economics (201-205)", "body": "Dynamic utility gates and stabilizers.", "files": ["PiRC-201.py", "PiRC-205.py"]},
    {"branch": "feat/pirc-207-matrix", "title": "🌈 PR 3: 7-Layer Token Matrix (207)", "body": "Grand Unified Orchestrator implementation.", "files": ["PiRC-207.md", "diagrams/matrix.mmd"]},
    {"branch": "feat/pirc-208-214-ai", "title": "🧠 PR 4: AI & Oracle Networks (208/214/237)", "body": "Decentralized AI feeds and proofs.", "files": ["PiRC-208.py", "PiRC-214.py", "PiRC-237.py"]},
    {"branch": "feat/pirc-209-217-id", "title": "🆔 PR 5: Identity & ZK (209/217/221)", "body": "Sovereign DID and KYC layer.", "files": ["PiRC-209.md", "PiRC-217.sol", "PiRC-221.sol"]},
    {"branch": "feat/pirc-210-211-bridge", "title": "🌉 PR 6: Cross-Ledger Bridges (210/211)", "body": "Soroban and EVM portability.", "files": ["PiRC-210.md", "PiRC-211.sol"]},
    {"branch": "feat/pirc-212-248-gov", "title": "⚖️ PR 7: Decentralized Governance (212/248)", "body": "Multi-chain voting and execution.", "files": ["PiRC-212.sol", "PiRC-248.sol"]},
    {"branch": "feat/pirc-213-224-rwa", "title": "🏢 PR 8: RWA Tokenization (213/224)", "body": "Fractional ownership of physical assets.", "files": ["PiRC-213.sol", "PiRC-224.md"]},
    {"branch": "feat/pirc-215-227-amm", "title": "💧 PR 9: Advanced AMM (215/227)", "body": "Liquidity for illiquid assets.", "files": ["PiRC-215.py", "PiRC-227.py"]},
    {"branch": "feat/pirc-216-238-risk", "title": "🛡️ PR 10: AI Risk Oracles (216/238/247)", "body": "Predictive compliance and risk engine.", "files": ["PiRC-216.py", "PiRC-238.py", "PiRC-247.sol"]},
    {"branch": "feat/pirc-218-240-yield", "title": "🌾 PR 11: Staking & Yield (218/235/240)", "body": "DeFi yield and automated farming.", "files": ["PiRC-218.sol", "PiRC-235.sol", "PiRC-240.py"]},
    {"branch": "feat/pirc-220-252-treasury", "title": "🏦 PR 12: Ecosystem Treasury (220/252/253)", "body": "Automated grants and diversification.", "files": ["PiRC-220.sol", "PiRC-252.py", "PiRC-253.sol"]},
    {"branch": "feat/pirc-223-246-custody", "title": "🔐 PR 13: Institutional Custody (223/246)", "body": "Zero-trust escrow and vaults.", "files": ["PiRC-223.sol", "PiRC-246.sol"]},
    {"branch": "feat/pirc-225-226-reserves", "title": "📊 PR 14: Proof of Reserves (225/226)", "body": "Backing transparency and fractionalization.", "files": ["PiRC-225.md", "PiRC-226.sol"]},
    {"branch": "feat/pirc-228-justice", "title": "⚖️ PR 15: Justice Engine (228)", "body": "Decentralized arbitration and slashing.", "files": ["PiRC-228.sol"]},
    {"branch": "feat/pirc-231-232-lending", "title": "💸 PR 16: Lending & Liquidations (231/232)", "body": "DeFi 2.0 lending markets.", "files": ["PiRC-231.sol", "PiRC-232.py"]},
    {"branch": "feat/pirc-233-234-synth", "title": "🧬 PR 17: Synthetic Assets (233/234)", "body": "Flash loan resistance and synths.", "files": ["PiRC-233.sol", "PiRC-234.sol"]},
    {"branch": "feat/pirc-244-245-cbdc", "title": "🏦 PR 18: CBDC Settlement (244/245)", "body": "Wholesale CBDC and batch settlement.", "files": ["PiRC-244.md", "PiRC-245.py"]},
    {"branch": "feat/pirc-254-255-failsafe", "title": "🛑 PR 19: Circuit Breakers (254/255)", "body": "Emergency pro-rata withdrawals.", "files": ["PiRC-254.sol", "PiRC-255-Withdrawal.md"]},
    {"branch": "feat/pirc-260-final", "title": "🏁 PR 20: Master Registry V3 (249/259/260)", "body": "Global state sync and finalization.", "files": ["PiRC-249.md", "PiRC-259.md", "PiRC-260.sol"]}
]

def run(cmd):
    print(f">> {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0: print(f"⚠️ {res.stderr}")
    return res.stdout

def setup_files(files):
    for f in files:
        os.makedirs(os.path.dirname(f), exist_ok=True) if "/" in f else None
        if not os.path.exists(f):
            with open(f, "w") as fout: fout.write(f"# PiRC Compliance: {f}")

def main():
    run(f"git checkout {SOURCE_BRANCH}")
    for pr in PR_BATCHES:
        setup_files(pr["files"])
        run(f"git checkout -b {pr['branch']}")
        for f in pr["files"]: run(f"git add {f}")
        run(f"git commit -m '{pr['title']}'")
        run(f"git push -u {REMOTE_NAME} {pr['branch']}")
        with open("body.md", "w") as f: f.write(pr["body"])
        run(f"gh pr create --title '{pr['title']}' --body-file body.md --base {BASE_BRANCH} --head {pr['branch']}")
        run(f"git checkout {SOURCE_BRANCH}")
        time.sleep(2)

if __name__ == "__main__":
    main()

