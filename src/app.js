import express from "express";
import { getPiHealth } from "./services/piHealth.js";
import { analyzeHealth } from "./oracle/aiOracle.js";
import { takeAction } from "./engine/actionEngine.js";

//  import metrics
import metricsRoute, { updateMetrics } from "./routes/metrics.js";

const app = express();

app.use(express.json());

//  register endpoint metrics
app.use("/metrics", metricsRoute);

//  endpoint utama
app.get("/health-check", async (req, res) => {
  try {
    const health = await getPiHealth();
    const analysis = analyzeHealth(health);
    const action = await takeAction(analysis);

    //  update metrics DI SINI (bukan di luar)
    updateMetrics({ health, analysis, action });

    res.json({
      health,
      analysis,
      action
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch health"
    });
  }
});

export default app;
