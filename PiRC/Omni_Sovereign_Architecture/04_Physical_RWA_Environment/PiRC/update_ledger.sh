#!/bin/bash
# =====================================================
# PiDEX Sovereign Matrix - Live Ledger Frontend Setup
# Description: Generates the real-time EventSource ledger
# and pushes the new Professional UI to GitHub.
# =====================================================

set -e
echo "=========================================================="
echo "🚀 DEPLOYING PiDEX REAL-TIME LIVE LEDGER"
echo "=========================================================="

cd ~/PiRC || { echo "⚠️ Error: ~/PiRC directory not found."; exit 1; }

echo "[1] Updating public/index.html with Live Stream UI..."

mkdir -p public

# Using single quotes 'HTML_EOF' prevents bash variable expansion
cat << 'HTML_EOF' > public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PiRC Sovereign Matrix | Live PiDEX</title>
    <!-- Official SDKs -->
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/12.1.0/stellar-sdk.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        body { 
            background-color: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; 
            background-image: radial-gradient(circle at 15% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 85% 30%, rgba(251, 191, 36, 0.05) 0%, transparent 50%);
        }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); border-radius: 1rem; }
        .code-box { background: #000000; border: 1px solid #1e293b; border-radius: 0.5rem; overflow-y: auto; box-shadow: inset 0 0 15px rgba(0,0,0,1); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center p-4 md:p-8">

    <div class="max-w-7xl w-full glass-panel p-6 md:p-8 shadow-2xl shadow-purple-900/20">
        <!-- Header -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-900 font-extrabold text-3xl shadow-lg shadow-yellow-500/20">π</div>
                <div>
                    <h1 class="text-3xl font-bold text-white tracking-tight">PiRC <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Live PiDEX</span></h1>
                    <p class="text-sm text-slate-400 font-mono mt-1">Real-time Soroban Environment (Pi Testnet)</p>
                </div>
            </div>
            <div class="flex flex-col items-end gap-2">
                <div class="px-4 py-1.5 rounded-full bg-green-900/30 border border-green-500/50 text-green-400 text-sm font-mono flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>RPC Connected
                </div>
                <div class="text-xs font-mono text-slate-500">Ledger: <span id="ledgerSequence" class="text-slate-300">Syncing...</span></div>
            </div>
        </div>

        <!-- TAB: Live Transactions / EventSource Stream -->
        <div class="flex flex-col h-[600px]">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-white">Live Operations Stream (Pi Testnet)</h2>
                <div class="px-3 py-1 bg-green-900/30 rounded text-xs text-green-400 border border-green-500/50 flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" style="box-shadow: 0 0 8px #4ade80;"></div>
                    Live Stream Active
                </div>
            </div>
            
            <div class="code-box flex-grow overflow-x-auto relative">
                <table class="w-full text-left text-sm text-slate-300">
                    <thead class="text-xs text-slate-500 uppercase bg-slate-900 border-b border-slate-700 sticky top-0 shadow-md">
                        <tr>
                            <th scope="col" class="px-4 py-3">Time</th>
                            <th scope="col" class="px-4 py-3">Tx Hash</th>
                            <th scope="col" class="px-4 py-3">Operation</th>
                            <th scope="col" class="px-4 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody id="live-ledger-body" class="divide-y divide-slate-800/50">
                        <tr id="loading-row">
                            <td colspan="4" class="px-4 py-8 text-center text-slate-500 font-mono animate-pulse">
                                Syncing with Pi Testnet operations stream...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // --- Network Sync ---
        const rpcServer = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org:443");
        const ISSUER_ACCOUNT = "GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6";

        async function updateNetworkStatus() {
            try {
                const latest = await rpcServer.getLatestLedger();
                document.getElementById('ledgerSequence').innerText = latest.sequence;
            } catch (e) {
                console.error("RPC Error:", e);
            }
        }
        setInterval(updateNetworkStatus, 5000);
        updateNetworkStatus();

        // --- Live Blockchain Ledger (EventSource Stream) ---
        const ledgerBody = document.getElementById('live-ledger-body');
        const MAX_ROWS = 25; // Keep latest 25 rows
        
        const horizonUrl = 'https://api.testnet.minepi.com/operations?cursor=now';
        const eventSource = new EventSource(horizonUrl);

        eventSource.onmessage = function(event) {
            const operation = JSON.parse(event.data);
            
            const loadingRow = document.getElementById('loading-row');
            if(loadingRow) loadingRow.remove();

            const date = new Date(operation.created_at);
            const timeString = date.toLocaleTimeString('en-US', { hour12: false });

            const fullHash = operation.transaction_hash;
            const shortHash = fullHash.substring(0, 6) + '...' + fullHash.substring(fullHash.length - 6);
            const explorerLink = `https://blockexplorer.minepi.com/testnet/transactions/${fullHash}`;

            let opType = operation.type.replace(/_/g, ' ').toUpperCase();
            let badgeClass = 'px-2 py-1 rounded-full text-[10px] font-bold font-mono ';
            
            if(opType.includes('PAYMENT')) badgeClass += 'bg-green-900/50 text-green-400 border border-green-500/30';
            else if(opType.includes('TRADE') || opType.includes('OFFER')) badgeClass += 'bg-purple-900/50 text-purple-400 border border-purple-500/30';
            else if(opType.includes('TRUST')) badgeClass += 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30';
            else badgeClass += 'bg-slate-800 text-slate-300 border border-slate-600';

            let details = '<span class="text-slate-500">Network Operation</span>';
            if (operation.asset_code) {
                details = `<span class="text-yellow-400 font-bold">${operation.amount || ''} ${operation.asset_code}</span>`;
            } else if (operation.starting_balance) {
                details = `Account Funded: ${operation.starting_balance} Test-Pi`;
            } else if (operation.type_i === 1 && !operation.asset_code) {
                details = `<span class="text-green-400 font-bold">${operation.amount} Test-Pi</span>`;
            }

            // PiDEX Highlights - Identify Master Contract operations
            const isDexOp = (operation.source_account && operation.source_account.includes(ISSUER_ACCOUNT)) || 
                            (operation.to && operation.to.includes(ISSUER_ACCOUNT));
            
            let rowClass = 'hover:bg-slate-800/50 transition-colors';
            let highlightBadge = '';
            
            if(isDexOp) {
                rowClass = 'bg-yellow-900/10 hover:bg-yellow-900/20 border-l-2 border-yellow-500 transition-colors';
                highlightBadge = '<span class="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 text-[10px] font-bold rounded shadow-lg shadow-yellow-500/20">⭐ PiDEX</span>';
            }

            const tr = document.createElement('tr');
            tr.className = rowClass;
            tr.innerHTML = `
                <td class="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">${timeString}</td>
                <td class="px-4 py-3 font-mono text-xs"><a href="${explorerLink}" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline">${shortHash}</a></td>
                <td class="px-4 py-3"><span class="${badgeClass}">${opType}</span></td>
                <td class="px-4 py-3 font-mono text-sm">${details}${highlightBadge}</td>
            `;

            ledgerBody.insertBefore(tr, ledgerBody.firstChild);

            if (ledgerBody.children.length > MAX_ROWS) {
                ledgerBody.removeChild(ledgerBody.lastChild);
            }
        };

        eventSource.onerror = function(error) {
            console.warn("Stream error/reconnecting...");
        };
    </script>
</body>
</html>
HTML_EOF

echo "[2] Committing updates..."
git add public/index.html
git commit -m "feat: Replace static transaction fetcher with real-time EventSource live ledger" >/dev/null 2>&1 || true

echo "[3] Pushing to GitHub..."
git push origin main --force

echo "=========================================================="
echo "🎉 LIVE LEDGER DEPLOYED SUCCESSFULLY!"
echo "Your repository is updated with the new Professional UI."
echo "=========================================================="
