import express from "express";
import { inheritanceEngine } from "../core/inheritance/fullEngine.js";
import { calculateAdvancedZakat } from "../core/zakat/advancedZakat.js";
import { validate } from "../middleware/validate.js";

const app = express();
app.use(express.json());

app.post("/inheritance", validate, (req, res) => {
  try {
    const result = inheritanceEngine(req.body);
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/zakat", validate, (req, res) => {
  try {
    const zakat = calculateAdvancedZakat(req.body);
    res.json({ zakat });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
