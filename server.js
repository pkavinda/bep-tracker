import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("BEP SIMPLE TRACKER LIVE");
});

app.get("/track", async (req, res) => {
  const code = (req.query.code || "").trim();

  if (!code) {
    return res.json({ error: "No tracking number" });
  }

  try {
    const response = await fetch("https://bepost.lk/p/Search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://bepost.lk/p/Search/"
      },
      body: `trackingNumber=${code}`
    });

    const html = await response.text();

    // simple extraction (text-based)
    const text = html.replace(/<[^>]*>/g, " ");

    res.json({
      ok: true,
      preview: text.slice(0, 1200)
    });

  } catch (err) {
    res.json({
      error: "Request failed",
      details: err.toString()
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
