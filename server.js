const express = require("express");
const axios = require("axios");
const app = express();

// 🔥 simple in-memory cache
const cache = {};
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

app.get("/", (req, res) => {
  res.send("Sri Lanka Post Tracker API Running ✅");
});

app.get("/track", async (req, res) => {
  const barcode = req.query.barcode;

  if (!barcode) {
    return res.json({ success: false, error: "No barcode" });
  }

  // ✅ Check cache first
  if (cache[barcode] && (Date.now() - cache[barcode].time < CACHE_TIME)) {
    return res.json({
      ...cache[barcode].data,
      cached: true
    });
  }

  // 🔁 Fetch function
  async function fetchTracking() {
    return axios({
      method: "post",
      url: "https://bepost.lk/p/Search/",
      data: new URLSearchParams({ barcode }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": [
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          "Mozilla/5.0 (X11; Linux x86_64)"
        ][Math.floor(Math.random()*3)],
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://bepost.lk",
        "Referer": "https://bepost.lk/"
      },
      timeout: 15000,
      validateStatus: () => true
    });
  }

  try {
    let response;

    // 🔁 retry up to 3 times
    for (let i = 0; i < 3; i++) {
      response = await fetchTracking();

      if (response.data && response.data.length > 300) break;
    }

    const html = response.data;

    if (!html || html.length < 200) {
      return res.json({
        success: false,
        error: "No tracking updates yet"
      });
    }

    // 🔍 parse tracking table
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

    const result = {
      success: true,
      barcode,
      status: history[0]?.status || "Processing",
      history
    };

    // ✅ Save to cache
    cache[barcode] = {
      time: Date.now(),
      data: result
    };

    res.json(result);

  } catch (err) {
    res.json({
      success: false,
      error: "Tracking temporarily unavailable"
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));
