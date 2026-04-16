const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Home route (so no "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Sri Lanka Post Tracking API Running ✅");
});

// ✅ TRACK ROUTE (GET for testing + Shopify use)
app.get("/track", async (req, res) => {
  const barcode = req.query.barcode;

  if (!barcode) {
    return res.json({ success: false, error: "No barcode provided" });
  }

  try {
    const response = await axios.post(
      "https://bepost.lk/p/Search/",
      new URLSearchParams({ barcode }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const html = response.data;

    // 🔍 Extract table rows (basic parsing)
    const matches = [...html.matchAll(/<tr>(.*?)<\/tr>/gs)];

    const history = matches.map(row => {
      const cols = [...row[1].matchAll(/<td.*?>(.*?)<\/td>/gs)]
        .map(c => c[1].replace(/<.*?>/g, "").trim());

      if (cols.length >= 3) {
        return {
          date: cols[0],
          location: cols[1],
          status: cols[2]
        };
      }
    }).filter(Boolean);

    res.json({
      success: true,
      barcode,
      status: history[0]?.status || "No updates",
      history
    });

  } catch (err) {
    res.json({
      success: false,
      error: "Failed to fetch tracking"
    });
  }
});

// Render uses dynamic port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));
