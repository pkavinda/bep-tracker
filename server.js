import express from "express";
import cheerio from "cheerio";

const app = express();

// Health check
app.get("/", (req, res) => {
  res.send("BEP Tracker Running");
});

app.get("/track", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.json({ error: "No tracking number" });
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
    const $ = cheerio.load(html);

    const status = $("td:contains('Status')").next("td").text().trim();
    const date = $("td:contains('Date')").next("td").text().trim();
    const location = $("td:contains('Location')").next("td").text().trim();

    res.json({ status, date, location });

  } catch (err) {
    res.json({ error: err.toString() });
  }
});

// IMPORTANT for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
