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

    // 🔥 REPLACED CORE STARTS HERE

    // wait for input
    await page.waitForSelector("input", { timeout: 15000 });

    // type tracking
    await page.type("input", code);

    // try clicking submit button
    const btn = await page.$("button, input[type='submit']");
    if (btn) {
      await btn.click();
    } else {
      await page.keyboard.press("Enter");
    }

    // wait for ANY content change (not table)
    await page.waitForTimeout(5000);

    // get full page text
    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    // return raw content for debug
    res.json({
      ok: true,
      preview: content.slice(0, 1000)
    });

    // 🔥 REPLACED CORE ENDS HERE

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
