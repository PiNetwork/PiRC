import express from "express";

const router = express.Router();

let latestData = {};

export function updateMetrics(data) {
  latestData = data;
}

router.get("/metrics", (req, res) => {
  res.json(latestData);
});

export default router;
