import express from "express";
import puppeteer from "puppeteer-core";

const app = express();

// ✅ Health check
app.get("/", (req, res) => {
  res.send("BEP Tracker FINAL LIVE");
});

// ✅ Tracking route
app.get("/track", async (req, res) => {
  const code = (req.query.code || "").trim();

  if (!code) {
    return res.json({ error: "No tracking number" });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors"
      ],
      headless: true
    });

    const page = await browser.newPage();

    // ✅ Ignore HTTPS errors
    await page.setExtraHTTPHeaders({
      "User-Agent": "Mozilla/5.0"
    });

    await page.goto("https://bepost.lk/p/Search/", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // ✅ Input tracking number
    await page.type("input[name='trackingNumber']", code);

    // ✅ Submit form
    await Promise.all([
      page.keyboard.press("Enter"),
      page.waitForNavigation({ waitUntil: "networkidle2" })
    ]);

    // ✅ Extract table data
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tr");
      const result = {};

      rows.forEach(row => {
        const cols = row.querySelectorAll("td");
        if (cols.length === 2) {
          const key = cols[0].innerText.trim();
          const value = cols[1].innerText.trim();
          result[key] = value;
        }
      });

      return result;
    });

    await browser.close();

    // ✅ Clean output
    res.json({
      status: data["Status"] || "Processing",
      date: data["Date"] || "",
      location: data["Location"] || "",
      details: data
    });

  } catch (err) {
    if (browser) await browser.close();

    res.json({
      error: "Tracking failed",
      details: err.toString()
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
