import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
app.use(express.json());

app.post("/track", async (req, res) => {
  const { barcode } = req.body;

  try {
    // 1. Get page (to get token)
    const page = await fetch("https://bepost.lk/p/Search/");
    const cookies = page.headers.get("set-cookie");
    const html = await page.text();

    const $ = cheerio.load(html);
    const token = $('input[name="csrf_token"]').val();

    // 2. Send tracking request
    const result = await fetch("https://bepost.lk/p/Search/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookies
      },
      body: `csrf_token=${token}&website=&barcode=${barcode}`
    });

    const resultHtml = await result.text();
    const $$ = cheerio.load(resultHtml);

    // 3. Extract data
    let data = {};
    $$(".result-table tr").each((i, el) => {
      const key = $$(el).find("td").eq(0).text().trim();
      const val = $$(el).find("td").eq(1).text().trim();
      if (key) data[key] = val;
    });

    res.json({
      success: true,
      data
    });

  } catch (e) {
    res.json({ success: false });
  }
});

app.listen(3000);
