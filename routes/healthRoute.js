import express from "express";
import { getPiHealth } from "../services/piHealth.js";
import { analyzeHealth } from "../oracle/aiOracle.js";
import { takeAction } from "../engine/actionEngine.js";

const router = express.Router();

router.get("/health-check", async (req, res) => {
  try {
    const health = await getPiHealth();
    const analysis = analyzeHealth(health);
    const action = takeAction(analysis);

    res.json({ health, analysis, action });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch health"
    });
  }
});

export default router;
