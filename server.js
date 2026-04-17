const express = require("express");
const axios = require("axios");
const app = express();

app.get("/", (req, res) => {
  res.send("Tracker running ✅");
});

// 🔥 Level 2 tracker
app.get("/track", async (req, res) => {
  const barcode = req.query.barcode;

  if (!barcode) {
    return res.json({ success: false, error: "No barcode" });
  }

  // function to request with headers
  async function fetchTracking() {
    return axios({
      method: "post",
      url: "https://bepost.lk/p/Search/",
      data: new URLSearchParams({ barcode }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Origin": "https://bepost.lk",
        "Referer": "https://bepost.lk/",
        "Accept": "text/html,application/xhtml+xml"
      },
      timeout: 15000
    });
  }

  try {
    let response;

    // 🔁 retry system (important)
    try {
      response = await fetchTracking();
    } catch (err) {
      // retry once
      response = await fetchTracking();
    }

    const html = response.data;

    if (!html || html.length < 200) {
      return res.json({
        success: false,
        error: "No tracking data yet"
      });
    }

    // 🔍 extract rows
    const rows = [...html.matchAll(/<tr>(.*?)<\/tr>/gs)];

    const history = rows.map(row => {
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
      status: history[0]?.status || "Processing",
      history
    });

  } catch (err) {
    res.json({
      success: false,
      error: "Tracking temporarily unavailable"
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));
