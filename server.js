import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/track", async (req, res) => {
  const code = (req.query.code || "").trim();

  if (!code) {
    return res.status(400).json({ error: "No tracking number" });
  }

  try {
    const response = await fetch("https://bepost.lk/p/Search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0"
      },
      body: new URLSearchParams({
        trackingNumber: code
      })
    });

    const html = await response.text();

    res.json({
      ok: true,
      tracking: code,
      html
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch BEP",
      details: String(err)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Running on port " + PORT);
});
