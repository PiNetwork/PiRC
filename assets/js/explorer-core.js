import { ALGORITHM_BASE_MICROS } from './constants.js';
import { normalizeMicrosToMacro, calculateWcfParity } from './calculations.js';
 api/merchant-frontend

rwa-conceptual-auth-extension
import { fetchBalances } from './wallet-balance.js';

// ================= CONFIG =================
const REFRESH_INTERVAL_MS = 5000;

// ================= WALLET STATE =================
let connectedWallet = null;

// ================= TRANSLATIONS =================
const translations = {
    en: {

 main

// Configuration
const REFRESH_INTERVAL_MS = 5000; // 5 seconds for simulation fidelity

// Multilingual translations database
const translations = {
    en: {
        metrics_iou_price: "IOU Speculative Parity",
        metrics_wcf_price: "Vanguard Bridge Backed Parity ($WCF)",
        metrics_wcf_ref: "Conceptual Pioneer Equity ($REF)",
        col_hash: "TX HASH",
        col_class: "CLASSIFICATION",
        col_micros: "CEX MICROS",
        col_macro: "MACRO PI",
        col_ref: "WEIGHTED (REF)",
        chart_title: "IOU Price Visualization (Simulation)",
 api/merchant-frontend

        Backup-copy
 main
        telemetry_status: "Live Technical Telemetry",
        cex_price: "External Market (Speculative IOU)",
        wcf_parity: "Vanguard Justice Parity (WCF)",
        pioneer_equity: "Pioneer Equity (Ref)",
        bridge_cap: "Bridge Liquidity Cap",
 api/merchant-frontend

        rwa-conceptual-auth-extension
        ledger_title: "Vanguard Bridge Real-Time Ledger"
    },
    id: {

 main
        ledger_title: "Vanguard Bridge Real-Time Ledger",
        footer_disclaimer: "This interface is a research prototype visualizing PiRC-101 conceptual modeling. It is NOT an official Pi Network utility."
    },
    ar: {
        metrics_iou_price: "تكافؤ IOU المضاربي",
        metrics_wcf_price: "تكافؤ الأوزان المدعوم ($WCF)",
        metrics_wcf_ref: "قيمة حقوق الرواد المرجحة ($REF)",
        col_hash: "TX HASH",
        col_class: "التصنيف",
        col_micros: "CEX MICROS",
        col_macro: "MACRO PI",
        col_ref: "الوزن المرجح",
        chart_title: "تصور سعر IOU (محاكاة)",
        telemetry_status: "القياس الفني المباشر",
        cex_price: "السوق الخارجي (IOU المضاربي)",
        wcf_parity: "تكافؤ العدالة (WCF)",
        pioneer_equity: "حقوق الرواد (المرجع)",
        bridge_cap: "سقف سيولة الجسر",
        ledger_title: "دفتر الأستاذ للقياس العادل",
        footer_disclaimer: "هذه الواجهة عبارة عن نموذج بحثي لتصور نمذجة PiRC-101 المفاهيمية. إنها ليست أداة رسمية لشبكة Pi."
    },
    zh: {
        metrics_iou_price: "IOU 投机性挂钩",
        metrics_wcf_price: "Vanguard Bridge 支持挂钩 ($WCF)",
        metrics_wcf_ref: "概念先锋权益 ($REF)",
        col_hash: "TX HASH",
        col_class: "分类",
        col_micros: "CEX MICROS",
        col_macro: "MACRO PI",
        col_ref: "加权 (REF)",
        chart_title: "IOU 价格可视化（模拟）",
        telemetry_status: "实时技术遥测",
        cex_price: "外部市场（投机性 IOU）",
        wcf_parity: "公正平价（WCF）",
        pioneer_equity: "先锋权益（参考）",
        bridge_cap: "桥接流动性上限",
        ledger_title: "公正遥测账本",
        footer_disclaimer: "此界面是可视化 PiRC-101 概念建模的研究原型。不是官方 Pi Network 实用程序。"
    },
    id: {
        metrics_iou_price: "Paritas Spekulatif IOU",
        metrics_wcf_price: "Paritas Didukung Vanguard Bridge ($WCF)",
        metrics_wcf_ref: "Ekuitas Pionir Konseptual ($REF)",
        col_hash: "TX HASH",
        col_class: "KLASIFIKASI",
        col_micros: "CEX MICROS",
        col_macro: "MACRO PI",
        col_ref: "TERBOBOT (REF)",
        chart_title: "Visualisasi Harga IOU (Simulasi)",
 api/merchant-frontend

        Backup-copy
 main
        telemetry_status: "Telemetri Teknis Langsung",
        cex_price: "Pasar Eksternal (IOU Spekulatif)",
        wcf_parity: "Paritas Keadilan (WCF)",
        pioneer_equity: "Ekuitas Pionir (Ref)",
        bridge_cap: "Batas Likuiditas Jembatan",
 api/merchant-frontend

        rwa-conceptual-auth-extension
        ledger_title: "Buku Besar Telemetri Keadilan"
    }
};

let currentLang = 'en';
let selectedCurrency = 'USD';

// ================= WALLET BRIDGE =================
export async function setWallet(address) {
    connectedWallet = address;
    console.log("Wallet connected:", address);

    await syncBalances();
}

// ================= BALANCE SYNC =================
async function syncBalances() {
    if (!connectedWallet) return;

    try {
        const balances = await fetchBalances(connectedWallet);

        balances.forEach(item => {
            const row = document.querySelector(`tr[data-layer="${item.layer}"]`);
            if (!row) return;

            const balEl = row.querySelector(".balance");
            const statusEl = row.querySelector(".status");

            if (balEl) balEl.innerText = item.balance;
            if (statusEl) statusEl.innerText = item.status;
        });

    } catch (e) {
        console.error("Balance sync error:", e);
    }
}

// ================= LANGUAGE =================
export function changeLanguage(lang) {
    currentLang = lang;

    document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';


 main
        ledger_title: "Buku Besar Telemetri Keadilan",
        footer_disclaimer: "Antarmuka ini adalah prototipe penelitian yang memvisualisasikan pemodelan konseptual PiRC-101. Ini BUKAN utilitas resmi Pi Network."
    },
    fr: {
        metrics_iou_price: "Parité spéculative IOU",
        metrics_wcf_price: "Parité soutenue Vanguard Bridge ($WCF)",
        metrics_wcf_ref: "Fonds propres conceptuels des Pionniers ($REF)",
        col_hash: "HASH TX",
        col_class: "CLASSIFICATION",
        col_micros: "MICROS CEX",
        col_macro: "MACRO PI",
        col_ref: "PONDÉRÉ (REF)",
        chart_title: "Visualisation du prix IOU (Simulation)",
        telemetry_status: "Télémétrie technique en direct",
        cex_price: "Marché externe (IOU spéculatif)",
        wcf_parity: "Parité de justice (WCF)",
        pioneer_equity: "Fonds propres Pionnier (Réf)",
        bridge_cap: "Plafond de liquidité du pont",
        ledger_title: "Registre de télémétrie de justice",
        footer_disclaimer: "Cette interface est un prototype de recherche visualisant la modélisation conceptuelle PiRC-101. Ce n'est PAS un utilitaire officiel de Pi Network."
    },
    ms: {
        metrics_iou_price: "Pariti Spekulatif IOU",
        metrics_wcf_price: "Pariti Disokong Vanguard Bridge ($WCF)",
        metrics_wcf_ref: "Ekuiti Pionir Konseptual ($REF)",
        col_hash: "HASH TX",
        col_class: "KLASIFIKASI",
        col_micros: "CEX MICROS",
        col_macro: "MACRO PI",
        col_ref: "DITIMBANG (REF)",
        chart_title: "Visualisasi Harga IOU (Simulasi)",
        telemetry_status: "Telemetri Teknikal Langsung",
        cex_price: "Pasaran Luaran (IOU Spekulatif)",
        wcf_parity: "Pariti Keadilan (WCF)",
        pioneer_equity: "Ekuiti Perintis (Ref)",
        bridge_cap: "Had Kecairan Jambatan",
        ledger_title: "Lejar Telemetri Keadilan",
        footer_disclaimer: "Antaramuka ini adalah prototaip penyelidikan yang memvisualisasikan pemodelan konseptual PiRC-101. Ia BUKAN utiliti rasmi Pi Network."
    }
};

// Global Fiat Currency & Exchange Rates (Conceptual Telemetry)
const FIAT_CURRENCY_DATA = {
    USD: { symbol: "$", rate: 1.0 },
    JOD: { symbol: "د.أ", rate: 0.71 },
    EGP: { symbol: "ج.م", rate: 47.90 },
    SAR: { symbol: "ر.س", rate: 3.75 },
    TND: { symbol: "د.ت", rate: 3.10 },
    EUR: { symbol: "€", rate: 0.92 },
    JPY: { symbol: "¥", rate: 150.45 }
};

let currentLang = 'en';
let selectedCurrency = 'USD';

/**
 * Changes the interface language and adjusts text direction
 * @param {string} lang - The language code (en, ar, etc.).
 */
export function changeLanguage(lang) {
    currentLang = lang;
    // Ar requires full Right-to-Left interface flip
    document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
 api/merchant-frontend

      Backup-copy
 main
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

api/merchant-frontend

 rwa-conceptual-auth-extension
// ================= CURRENCY =================
export function updateCurrency() {
    selectedCurrency = document.getElementById('currency-select')?.value || 'USD';
    syncTelemetry();
}

// ================= CHART INIT =================
const cexChart = LightweightCharts.createChart(document.getElementById('cex-chart'), {
    layout: { background: { color: 'transparent' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#30363d' }, horzLines: { color: '#30363d' } },
    height: 280
});
const cexLineSeries = cexChart.addLineSeries({ color: '#f85149', lineWidth: 2 });

const pircChart = LightweightCharts.createChart(document.getElementById('pirc-chart'), {
    layout: { background: { color: 'transparent' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#30363d' }, horzLines: { color: '#30363d' } },
    height: 280
});
const pircLineSeries = pircChart.addLineSeries({ color: '#ffa500', lineWidth: 2 });

// ================= TELEMETRY =================
async function syncTelemetry() {
    try {
        const priceRes = await fetch('/.netlify/functions/prices');
        const priceData = await priceRes.json();

        const tradeRes = await fetch('/.netlify/functions/trades');
        const tradeData = await tradeRes.json();

        const basePrice = priceData.aggregated?.price ?? 0;

        document.getElementById('cex-price-display').innerText = `$${basePrice.toFixed(4)}`;

        const wcfParity = basePrice * ALGORITHM_BASE_MICROS;
        document.getElementById('pirc-price-display').innerText = `$${wcfParity.toLocaleString()}`;
        document.getElementById('t-pi-price').innerText = `$${wcfParity.toLocaleString()}`;

        const now = Math.floor(Date.now() / 1000);

        cexLineSeries.update({ time: now, value: basePrice });
        pircLineSeries.update({ time: now, value: wcfParity });

        // ================= LEDGER =================

 main
/**
 * Handles currency switching for the entire dashboard
 */
export function updateCurrency() {
    selectedCurrency = document.getElementById('currency-select').value;
    syncTelemetry();
}

// Chart Initialization - CEX speculative price chart
const cexChart = LightweightCharts.createChart(document.getElementById('cex-chart'), {
    layout: { background: { color: 'transparent' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#30363d' }, horzLines: { color: '#30363d' } },
    height: 280,
    timeScale: { timeVisible: true, secondsVisible: false }
});
const cexLineSeries = cexChart.addLineSeries({ color: '#f85149', lineWidth: 2 });

// Chart Initialization - WCF parity chart
const pircChart = LightweightCharts.createChart(document.getElementById('pirc-chart'), {
    layout: { background: { color: 'transparent' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#30363d' }, horzLines: { color: '#30363d' } },
    height: 280,
    timeScale: { timeVisible: true, secondsVisible: false }
});
const pircLineSeries = pircChart.addLineSeries({ color: '#ffa500', lineWidth: 2 });

/**
 * Fetches telemetry data and updates the UI.
 */
async function syncTelemetry() {
    try {
        // Fetch prices from the Netlify Function (aggregates OKX + MEXC)
        const priceRes = await fetch('/.netlify/functions/prices');
        const priceData = await priceRes.json();
        const baseIouPriceUsd = priceData.aggregated?.price ?? 0;

        // Fetch recent trades from the Netlify Function
        const tradeRes = await fetch('/.netlify/functions/trades');
        const tradeData = await tradeRes.json();

        // Local Fiat Currency Conversion
        const currencyInfo = FIAT_CURRENCY_DATA[selectedCurrency];
        const convertedIouPrice = baseIouPriceUsd * currencyInfo.rate;

        // Update CEX price display
        document.getElementById('cex-price-display').innerText = `${currencyInfo.symbol}${convertedIouPrice.toFixed(4)}`;

        // Calculate and update WCF parity display
        // WCF parity: 1 Macro Pi = 10M micros worth of backed equity
        const wcfParityUsd = baseIouPriceUsd * ALGORITHM_BASE_MICROS;
        const convertedWcfParity = wcfParityUsd * currencyInfo.rate;
        document.getElementById('pirc-price-display').innerText = `${currencyInfo.symbol}${convertedWcfParity.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

        // Update token card
        document.getElementById('t-pi-price').innerText = `${currencyInfo.symbol}${convertedWcfParity.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

        // Update chart data
        const now = Math.floor(Date.now() / 1000);

        // Populate CEX chart with kline data if available, otherwise use live point
        if (priceData.klines && priceData.klines.length > 0) {
            cexLineSeries.setData(priceData.klines.map(k => ({
                time: k.time,
                value: k.close * currencyInfo.rate
            })));
        } else {
            cexLineSeries.update({ time: now, value: convertedIouPrice });
        }

        pircLineSeries.update({ time: now, value: convertedWcfParity });

        // Ledger population - transform real trades into Micro/Macro visualization
 api/merchant-frontend

   Backup-copy
 main
        const ledgerBody = document.getElementById('ledger-body');
        ledgerBody.innerHTML = '';

        const trades = tradeData.trades || [];
 api/merchant-frontend

 rwa-conceptual-auth-extension

        trades.slice(0, 10).forEach(t => {
            const micro = Math.round(t.amount * ALGORITHM_BASE_MICROS);
            const macro = normalizeMicrosToMacro(micro);
            const wcfVal = calculateWcfParity(parseFloat(macro), t.price);

            const row = `
            <tr class="tx-row">
                <td class="tx-cell">${String(t.tradeId).slice(0,6)}...</td>
                <td class="tx-cell">${t.side}</td>
                <td class="tx-cell">${micro}</td>
                <td class="tx-cell">${macro}</td>
                <td class="tx-cell">$${wcfVal.toFixed(2)}</td>
            </tr>
            `;

 main
        trades.slice(0, 15).forEach(t => {
            // Convert trade amount to micro units (each trade unit = 1 Micro on CEX)
            const microAmount = Math.round(t.amount * ALGORITHM_BASE_MICROS);
            const macroPi = normalizeMicrosToMacro(microAmount);
            const wcfVal = calculateWcfParity(parseFloat(macroPi), t.price);
            const convertedVal = wcfVal * currencyInfo.rate;

            const isBuy = t.side === 'buy';
            const classification = isBuy ? 'Pioneer' : 'CEX';
            const badgeClass = isBuy ? 'badge-pioneer' : 'badge-cex';
            const txHash = t.tradeId || String(t.timestamp);

            const row = `<tr class="tx-row">
                <td class="tx-cell"><span class="address-tag">${txHash.substring(0, 8)}...</span></td>
                <td class="tx-cell"><span class="badge ${badgeClass}">${classification}</span></td>
                <td class="tx-cell" style="font-family: monospace;">${microAmount.toLocaleString()} MICROS</td>
                <td class="tx-cell" style="font-family: monospace; font-weight: bold;">${parseFloat(macroPi).toLocaleString(undefined, { maximumFractionDigits: 4 })} π</td>
                <td class="tx-cell" style="color: #3fb950; font-weight: bold;">${currencyInfo.symbol}${convertedVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} (WCF)</td>
            </tr>`;
 api/merchant-frontend

  Backup-copy
 main
            ledgerBody.insertAdjacentHTML('beforeend', row);
        });

    } catch (e) {
 api/merchant-frontend

 rwa-conceptual-auth-extension
        console.error("Telemetry error:", e);
    }
}

// ================= GLOBAL BIND =================
window.changeLanguage = changeLanguage;
window.updateCurrency = updateCurrency;

// ================= LOOP =================
setInterval(() => {
    syncTelemetry();
    syncBalances(); // 🔥 tambahan penting
}, REFRESH_INTERVAL_MS);

// ================= INIT =================

 main
        console.error("Telemetry sync failed:", e);
    }
}

// Global scope definition for HTML onclick triggers
window.changeLanguage = changeLanguage;
window.updateCurrency = updateCurrency;

// Initial Start
setInterval(syncTelemetry, REFRESH_INTERVAL_MS);
 api/merchant-frontend

 Backup-copy
 main
syncTelemetry();
changeLanguage('en');
