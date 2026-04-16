import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("BEP Tracker Running (Live)");
});

app.get("/track", async (req, res) => {
  const code = (req.query.code || "").trim();

  if (!code) {
    return res.json({ error: "No tracking number" });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://bepost.lk/p/Search/", {
      waitUntil: "networkidle2"
    });

    await page.type("input[name='trackingNumber']", code);

    await Promise.all([
      page.keyboard.press("Enter"),
      page.waitForNavigation({ waitUntil: "networkidle2" })
    ]);

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

    res.json({
      status: data["Status"] || "",
      date: data["Date"] || "",
      location: data["Location"] || "",
      full: data
    });

  } catch (err) {
    if (browser) await browser.close();

    res.json({
      error: "Tracking failed",
      details: err.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Running on port " + PORT);
});
