import express from "express";

const app = express();

// ✅ Health route (Railway needs this)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ✅ Test route (no BEP yet — just to confirm server works)
app.get("/track", (req, res) => {
  const code = req.query.code || "NONE";

  res.json({
    status: "OK",
    tracking: code
  });
});

// ✅ IMPORTANT: correct port binding
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Running on port " + PORT);
});
