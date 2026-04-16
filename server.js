import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("BEP TRACKER FINAL WORKING");
});

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

    await page.goto("https://bepost.lk/p/Search/", {
      waitUntil: "networkidle2",
      timeout: 60000
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
          result[cols[0].innerText.trim()] = cols[1].innerText.trim();
        }
      });

      return result;
    });

    await browser.close();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
