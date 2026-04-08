// Fetches real recent trades from OKX and MEXC for Pi Network
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
    const [okxTradesRes, mexcTradesRes] = await Promise.allSettled([
      fetch("https://www.okx.com/api/v5/market/trades?instId=PI-USDT&limit=15"),
      fetch("https://api.mexc.com/api/v3/trades?symbol=PIUSDT&limit=15"),
    ]);

    let trades = [];

    if (okxTradesRes.status === "fulfilled" && okxTradesRes.value.ok) {
      const json = await okxTradesRes.value.json();
      if (json.data) {
        trades.push(
          ...json.data.map((t) => ({
            exchange: "OKX",
            price: parseFloat(t.px),
            amount: parseFloat(t.sz),
            side: t.side,
            timestamp: parseInt(t.ts),
            tradeId: t.tradeId,
          }))
        );
      }
    }

    if (mexcTradesRes.status === "fulfilled" && mexcTradesRes.value.ok) {
      const json = await mexcTradesRes.value.json();
      if (Array.isArray(json)) {
        trades.push(
          ...json.map((t) => ({
            exchange: "MEXC",
            price: parseFloat(t.price),
            amount: parseFloat(t.qty),
            side: t.isBuyerMaker ? "sell" : "buy",
            timestamp: t.time,
            tradeId: String(t.id),
          }))
        );
      }
    }

    // Sort by timestamp descending
    trades.sort((a, b) => b.timestamp - a.timestamp);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        timestamp: Date.now(),
        count: trades.length,
        trades: trades.slice(0, 25),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch trades", detail: err.message }),
    };
  }
};
