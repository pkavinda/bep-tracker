const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/track", async (req, res) => {
  const barcode = req.body.barcode;

  if (!barcode) {
    return res.json({ success: false, error: "No barcode" });
  }

  try {
    const response = await axios.post(
      "https://bepost.lk/p/Search/",
      new URLSearchParams({ barcode }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const html = response.data.replace(/<[^>]*>?/gm, "");

    res.json({
      success: true,
      status: "Fetched",
      raw: html.substring(0, 1000)
    });

  } catch (err) {
    res.json({
      success: false,
      error: "Fetch failed"
    });
  }
});

app.listen(10000, () => console.log("Server running"));
