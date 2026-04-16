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

    // wait for input
    await page.waitForSelector("input", { timeout: 15000 });

    // type tracking
    await page.type("input", code);

    // click or press enter
    const btn = await page.$("button, input[type='submit']");
    if (btn) {
      await btn.click();
    } else {
      await page.keyboard.press("Enter");
    }

    // ✅ FIXED DELAY
    await new Promise(resolve => setTimeout(resolve, 5000));

    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    res.json({
      ok: true,
      preview: content.slice(0, 1000)
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
