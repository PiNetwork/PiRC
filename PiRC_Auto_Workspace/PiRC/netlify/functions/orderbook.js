// Fetches real order book (warehouse/depth) data from OKX and MEXC for Pi Network
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    const [okxBookRes, mexcBookRes] = await Promise.allSettled([
      fetch("https://www.okx.com/api/v5/market/books?instId=PI-USDT&sz=10"),
      fetch("https://api.mexc.com/api/v3/depth?symbol=PIUSDT&limit=10"),
    ]);

    const result = { okx: null, mexc: null, summary: {} };

    if (okxBookRes.status === "fulfilled" && okxBookRes.value.ok) {
      const json = await okxBookRes.value.json();
      if (json.data && json.data[0]) {
        const book = json.data[0];
        result.okx = {
          bids: book.bids.map((b) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
          asks: book.asks.map((a) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
          timestamp: parseInt(book.ts),
        };
      }
    }

    if (mexcBookRes.status === "fulfilled" && mexcBookRes.value.ok) {
      const json = await mexcBookRes.value.json();
      result.mexc = {
        bids: (json.bids || []).map((b) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
        asks: (json.asks || []).map((a) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
        timestamp: json.lastUpdateId,
      };
    }

    // Compute summary across exchanges
    let totalBidVol = 0, totalAskVol = 0;
    let bestBid = 0, bestAsk = Infinity;

    for (const src of [result.okx, result.mexc]) {
      if (!src) continue;
      for (const b of src.bids) {
        totalBidVol += b.amount;
        if (b.price > bestBid) bestBid = b.price;
      }
      for (const a of src.asks) {
        totalAskVol += a.amount;
        if (a.price < bestAsk) bestAsk = a.price;
      }
    }

    result.summary = {
      bestBid: bestBid || null,
      bestAsk: bestAsk === Infinity ? null : bestAsk,
      spread: bestAsk !== Infinity && bestBid > 0 ? (bestAsk - bestBid).toFixed(4) : null,
      spreadPct: bestAsk !== Infinity && bestBid > 0 ? (((bestAsk - bestBid) / bestBid) * 100).toFixed(3) : null,
      totalBidVolume: totalBidVol,
      totalAskVolume: totalAskVol,
      buyPressure: totalBidVol + totalAskVol > 0 ? ((totalBidVol / (totalBidVol + totalAskVol)) * 100).toFixed(1) : null,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ timestamp: Date.now(), ...result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch order book", detail: err.message }),
    };
  }
};
