require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const helmet = require("helmet");

const app = express();

// Use Helmet middleware for security headers (automatically disables X-Powered-By)
app.use(helmet());

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("🤖 AI Chatbot backend is running.");
});

// API route to handle chat request
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  console.log("📨 Prompt received:", prompt);

  // Make sure API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ reply: "❌ API key missing in .env file" });
  }

  try {
    // THIS is the correct URL to call — OpenRouter API!
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo-0613",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("✅ OpenRouter Response:", data);

    if (data.error) {
      console.error("❌ OpenRouter API Error:", data.error);
      return res
        .status(500)
        .json({ reply: data.error.message || "OpenRouter error." });
    }

    const content = data.choices?.[0]?.message?.content;
    res.json({ reply: content || "⚠️ No response from model." });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ reply: "❌ Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
