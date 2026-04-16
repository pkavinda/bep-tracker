import express from "express";
import { chromium } from "playwright";

const app = express();

app.get("/", (req, res) => {
  res.send("PLAYWRIGHT VERSION LIVE");
});

app.get("/track", async (req, res) => {
  const code = (req.query.code || "").trim();

  if (!code) {
    return res.json({ error: "No tracking number" });
  }

  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://bepost.lk/p/Search/");

    await page.fill("input[type='text']", code);

    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.submit();
    });

    await page.waitForTimeout(8000);

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
