export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify([
      { id: "TR-001", type: "buy", amount: 1500, price: 3.140, timestamp: new Date(Date.now() - 5000).toISOString() },
      { id: "TR-002", type: "sell", amount: 200, price: 3.141, timestamp: new Date(Date.now() - 15000).toISOString() }
    ])
  };
};
