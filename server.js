import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("BEP TRACKER RENDER LIVE");
});

app.get("/track", async (req, res) => {
  const code = (req.query.code || "").trim();

  if (!code) {
    return res.json({ error: "No tracking number" });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors"
      ]
    });

    const page = await browser.newPage();

    // 🔥 Real browser behavior
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto("https://bepost.lk/p/Search/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForSelector("input[type='text']", { timeout: 15000 });

    await page.type("input[type='text']", code);

    // Submit form properly
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.submit();
    });

    // wait for results
    await new Promise(resolve => setTimeout(resolve, 8000));

    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    res.json({
      ok: true,
      preview: content.slice(0, 1500)
    });

  } catch (err) {
    if (browser) await browser.close();

    res.json({
      error: "Tracking failed",
      details: err.toString()
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
