// PiRC-207 v2: Chakra-Aligned 7-Layer Colored Token System
// Ordered Root → Crown for energetic & professional hierarchy
// Zero changes to existing ALGORITHM_BASE_MICROS or WCF parity

const ALGORITHM_BASE_MICROS = 10000000;

const TOKEN_LAYERS = {
    root: {      // Red
        chakra: "Root (Muladhara)",
        name: "Red Governance",
        label: "Governance Token",
        value: "GOV",
        color: "#FF0000",
        meaning: "Emotional control, grounding, security & stable governance",
        useCase: "Decision-making & network stability",
        subunit: { pi: 1 }
    },
    sacral: {    // Orange
        chakra: "Sacral (Svadhisthana)",
        name: "3141 Orange",
        label: "Orange Layer",
        value: 3141,
        color: "#FF7F00",
        meaning: "Creativity, flow & passion",
        useCase: "Mid-tier utility & creative economic expression",
        subunit: { pi: 1 }
    },
    solar: {     // Yellow
        chakra: "Solar Plexus (Manipura)",
        name: "31,140 Yellow",
        label: "Yellow Layer",
        value: 31140,
        color: "#FFFF00",
        meaning: "Personal power, confidence & willpower",
        useCase: "High-tier utility & individual empowerment",
        subunit: { pi: 1 }
    },
    heart: {     // Green
        chakra: "Heart (Anahata)",
        name: "Green 3.14",
        label: "PiCash (picach)",
        value: 3.14,
        color: "#00FF7F",
        meaning: "Love, compassion & balanced flow",
        useCase: "General utility & daily cash layer",
        subunit: { pigcv: 1000, pi: 10000 }
    },
    throat: {    // Blue
        chakra: "Throat (Vishuddha)",
        name: "Blue 314",
        label: "Banks & Financial Institutions",
        value: 314,
        color: "#00BFFF",
        meaning: "Communication, truth & clear expression",
        useCase: "Banking, institutional & financial layer",
        subunit: { pigcv: 1000, pi: 10000 }
    },
    thirdEye: {  // Indigo (refined from Gold for chakra purity)
        chakra: "Third Eye (Ajna)",
        name: "314,159 Indigo",
        label: "Premium Reserve Layer",
        value: 314159,
        color: "#4B0082",
        meaning: "Intuition, vision & higher insight",
        useCase: "Premium / strategic reserve layer",
        subunit: { pi: 1 }
    },
    crown: {     // Purple
        chakra: "Crown (Sahasrara)",
        name: "Purple Main",
        label: "Mined Currency & Fractions",
        value: 1,
        color: "#9932CC",
        meaning: "Universal connection, enlightenment & wholeness",
        useCase: "Core mined Pi & all fractions",
        subunit: { micro: ALGORITHM_BASE_MICROS }
    }
};

/** Colored π symbol for CEX distinction (all ≡ 1 Pi) */
function getColoredSymbol(layerKey) {
    const layer = TOKEN_LAYERS[layerKey];
    return `<span style="color:${layer.color}; font-size:1.8em; font-weight:bold;">π</span> <span style="color:${layer.color}">${layer.name}</span>`;
}

/** Bank/PiCash calculations (unchanged) */
function calculateToPiGCV(amount, layerKey) {
    if (!['heart', 'throat'].includes(layerKey)) return "N/A (fixed layer)";
    return (amount / 1000).toFixed(8);
}
function calculateToPi(amount, layerKey) {
    if (layerKey === 'crown') return amount.toFixed(8);
    if (['heart', 'throat'].includes(layerKey)) return (amount / 10000).toFixed(8);
    return amount.toFixed(8);
}
function calculateToMicros(amount, layerKey) {
    if (layerKey === 'crown') return (amount * ALGORITHM_BASE_MICROS).toFixed(0);
    if (['heart', 'throat'].includes(layerKey)) return (amount * 1000).toFixed(0);
    return "Layer-specific";
}

/** Render chakra-ordered professional section */
function renderTokenLayerSection() {
    const container = document.querySelector('.container');
    if (!container) return;

    const sectionHTML = `
    <div class="section-header" style="margin-top:40px;">
        <i class="fas fa-palette"></i> 
        <span>7-Layer Chakra-Aligned Token System (PiRC-207 v2)</span>
    </div>
    <div class="token-grid" id="token-layers-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));">
    </div>`;

    container.insertAdjacentHTML('beforeend', sectionHTML);
    const grid = document.getElementById('token-layers-grid');

    // Render in chakra order (Root → Crown)
    const order = ['root','sacral','solar','heart','throat','thirdEye','crown'];
    order.forEach(key => {
        const layer = TOKEN_LAYERS[key];
        const cardHTML = `
        <div class="token-card" style="border-left:5px solid ${layer.color}; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <div style="font-size:2.2em;margin-bottom:12px;">${getColoredSymbol(key)}</div>
            <div style="font-size:0.95rem;color:${layer.color};font-weight:600;">${layer.chakra}</div>
            <div class="token-price" style="color:${layer.color};">${layer.label}</div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin:10px 0;">
                ${layer.meaning}<br>
                Fixed value: <strong>${layer.value}</strong>
            </div>
            <div style="font-size:0.8rem;">
                <strong>Calculations (current algorithm):</strong><br>
                ${layer.subunit.pi ? `10,000 units = 1 Pi` : ''}
                ${layer.subunit.pigcv ? `1,000 units = 1 PiGCV` : ''}
                ${layer.subunit.micro ? `10M micro = 1 Pi` : ''}
            </div>
            <div style="margin-top:12px;font-size:0.75rem;color:var(--text-muted);">
                All π symbols ≡ 1 Pi on CEX • Blue/Heart layers bank-ready
            </div>
        </div>`;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    console.log("%c✅ PiRC-207 v2 Chakra Layers Loaded | Root→Crown hierarchy active", "color:#9932CC;font-weight:bold");
}

document.addEventListener('DOMContentLoaded', renderTokenLayerSection);

window.tokenLayers = { TOKEN_LAYERS, getColoredSymbol, calculateToPi, calculateToPiGCV, calculateToMicros };
