export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      asset: "PiRC Native",
      symbol: "PIRC/PI",
      current_price_pi: 3.1415,
      change_24h: "+5.2%",
      volume_24h: 1250000,
      timestamp: new Date().toISOString()
    })
  };
};
