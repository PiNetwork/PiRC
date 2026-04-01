import express from "express";
import { callRPC } from "./piClient.js";

const app = express();
const PORT = 3000;

// Endpoint health
app.get("/health", async (req, res) => {
  const data = await callRPC("getHealth");
  res.json(data);
});

// Endpoint ledger
app.get("/ledger", async (req, res) => {
  const data = await callRPC("getLatestLedger");
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
