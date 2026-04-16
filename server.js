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

    // Wait for ANY input field (safe)
await page.waitForSelector("input", { timeout: 15000 });

// Try multiple selectors
const inputSelectors = [
  "input[name='trackingNumber']",
  "#trackingNumber",
  "input[type='text']"
];

let found = false;

for (const selector of inputSelectors) {
  const exists = await page.$(selector);
  if (exists) {
    await page.type(selector, code);
    found = true;
    break;
  }
}

if (!found) {
  throw new Error("Tracking input field not found");
}

    await page.keyboard.press("Enter");

// wait for results table instead of navigation
await page.waitForSelector("table", { timeout: 20000 });

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
