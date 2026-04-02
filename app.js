import express from "express";
import healthRoute from "./routes/healthRoute.js";

const app = express();
app.use(express.json());

app.use("/api", healthRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 PiRC AI Oracle running on port ${PORT}`);
});
