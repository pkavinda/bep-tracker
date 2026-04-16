import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();

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

    const status = $("td:contains('Status')").next().text().trim();
    const date = $("td:contains('Date')").next().text().trim();
    const location = $("td:contains('Location')").next().text().trim();

    res.json({
      status,
      date,
      location
    });

  } catch (err) {
    res.json({ error: "Failed to fetch BEP" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
