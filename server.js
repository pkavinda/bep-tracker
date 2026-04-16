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

    // ✅ Wait for input
    await page.waitForSelector("input[type='text']", { timeout: 15000 });

    // ✅ Type tracking number
    await page.type("input[type='text']", code);

    // ✅ SUBMIT FORM DIRECTLY (KEY FIX)
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.submit();
    });

    // ✅ Wait for results to load
    await new Promise(resolve => setTimeout(resolve, 7000));

    // ✅ Get full page text
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
