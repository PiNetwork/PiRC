import { ALGORITHM_BASE_MICROS } from './constants.js';
import { normalizeMicrosToMacro, calculateWcfParity } from './calculations.js';
import { fetchBalances } from './wallet-balance.js';

// ================= CONFIG =================
const REFRESH_INTERVAL_MS = 5000; // 5 seconds for simulation fidelity

// ================= WALLET STATE =================
let connectedWallet = null;

// ================= TRANSLATIONS =================
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
        telemetry_status: "Live Technical Telemetry",
        cex_price: "External Market (Speculative IOU)",
        wcf_parity: "Vanguard Justice Parity (WCF)",
        pioneer_equity: "Pioneer Equity (Ref)",
        bridge_cap: "Bridge Liquidity Cap",
        ledger_title: "Vanguard Bridge Real-Time Ledger"
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
        telemetry_status: "Telemetri Teknis Langsung",
        cex_price: "Pasar Eksternal (IOU Spekulatif)",
        wcf_parity: "Paritas Keadilan (WCF)",
        pioneer_equity: "Ekuitas Pionir (Ref)",
        bridge_cap: "Batas Likuiditas Jembatan",
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

    const langPack = translations[currentLang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (key && langPack[key]) {
            el.innerText = langPack[key];
        }
    });
}

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
        const ledgerBody = document.getElementById('ledger-body');
        ledgerBody.innerHTML = '';

        const trades = tradeData.trades || [];

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

            ledgerBody.insertAdjacentHTML('beforeend', row);
        });

    } catch (e) {
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
syncTelemetry();
changeLanguage('en');
