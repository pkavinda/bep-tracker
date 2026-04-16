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
      body: `trackingNumber=${code}`
    });

    const html = await response.text();

    // 👇 IMPORTANT: return HTML so we inspect it
    res.json({
      ok: true,
      html: html.slice(0, 2000) // limit size
    });

  } catch (err) {
    res.json({
      error: "Fetch failed",
      details: err.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Running on port " + PORT);
});
