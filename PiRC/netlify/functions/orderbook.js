export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      bids: [
        { price: 3.140, amount: 5000 },
        { price: 3.138, amount: 12500 }
      ],
      asks: [
        { price: 3.142, amount: 1200 },
        { price: 3.145, amount: 8400 }
      ],
      timestamp: new Date().toISOString()
    })
  };
};
