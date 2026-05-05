// Fetches real-time Pi Network prices from OKX and MEXC exchanges
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=5",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const [okxRes, mexcRes, mexcKlineRes] = await Promise.allSettled([
      fetch("https://www.okx.com/api/v5/market/ticker?instId=PI-USDT"),
      fetch("https://api.mexc.com/api/v3/ticker/24hr?symbol=PIUSDT"),
      fetch("https://api.mexc.com/api/v3/klines?symbol=PIUSDT&interval=1m&limit=60"),
    ]);

    let okxData = null;
    let mexcData = null;
    let klineData = [];

    if (okxRes.status === "fulfilled" && okxRes.value.ok) {
      const json = await okxRes.value.json();
      if (json.data && json.data[0]) {
        const t = json.data[0];
        okxData = {
          price: parseFloat(t.last),
          high24h: parseFloat(t.high24h),
          low24h: parseFloat(t.low24h),
          vol24h: parseFloat(t.vol24h),
          change24h: parseFloat(t.last) - parseFloat(t.open24h),
          changePct: (((parseFloat(t.last) - parseFloat(t.open24h)) / parseFloat(t.open24h)) * 100).toFixed(2),
          bid: parseFloat(t.bidPx),
          ask: parseFloat(t.askPx),
        };
      }
    }

    if (mexcRes.status === "fulfilled" && mexcRes.value.ok) {
      const t = await mexcRes.value.json();
      mexcData = {
        price: parseFloat(t.lastPrice),
        high24h: parseFloat(t.highPrice),
        low24h: parseFloat(t.lowPrice),
        vol24h: parseFloat(t.volume),
        quoteVol24h: parseFloat(t.quoteVolume),
        change24h: parseFloat(t.priceChange),
        changePct: parseFloat(t.priceChangePercent).toFixed(2),
        trades: parseInt(t.count),
      };
    }

    if (mexcKlineRes.status === "fulfilled" && mexcKlineRes.value.ok) {
      const raw = await mexcKlineRes.value.json();
      klineData = raw.map((k) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    }

    // Compute aggregated price
    const prices = [okxData?.price, mexcData?.price].filter(Boolean);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        timestamp: Date.now(),
        aggregated: {
          price: avgPrice,
          sources: prices.length,
        },
        okx: okxData,
        mexc: mexcData,
        klines: klineData,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch prices", detail: err.message }),
    };
  }
};
