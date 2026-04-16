import express from "express";
import puppeteer from "puppeteer";

const app = express();

// ✅ Home route
app.get("/", (req, res) => {
  res.send("BEP TRACKER FINAL WORKING");
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

    await page.goto("https://bepost.lk/p/Search/", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // ✅ Wait for correct input
    await page.waitForSelector("input[type='text']", { timeout: 15000 });

    // ✅ Clear input safely
    await page.evaluate(() => {
      const input = document.querySelector("input[type='text']");
      if (input) input.value = "";
    });

    // ✅ Type tracking number
    await page.type("input[type='text']", code);

    // ✅ Click search button
    const searchBtn = await page.$("button, input[type='submit']");
    if (!searchBtn) {
      throw new Error("Search button not found");
    }

    await searchBtn.click();

    // ✅ Wait for results (AJAX load)
    await new Promise(resolve => setTimeout(resolve, 7000));

    // ✅ Get full page text
    const content = await page.evaluate(() => document.body.innerText);

    await browser.close();

    // ✅ Debug output (we will refine next)
    res.json({
      ok: true,
      preview: content.slice(0, 1200)
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
