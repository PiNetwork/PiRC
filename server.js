import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend aktif 🚀");
});

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
