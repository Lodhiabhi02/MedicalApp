import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("⚠️  Missing GEMINI_API_KEY in .env file!");
  process.exit(1);
}

console.log("✅ GEMINI_API_KEY Loaded:", GEMINI_API_KEY ? "Yes" : "No");

app.post("/get-medical-advice", async (req, res) => {
  try {
    const { extractedText } = req.body;
    if (!extractedText) {
      return res.status(400).json({ error: "No text provided for analysis." });
    }

    console.log("📜 Extracted Text:", extractedText);

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
      {
        prompt: {
          text: `Analyze the following medical report and provide medical advice:\n\n${extractedText}`,
        },
      },
      {
        params: { key: GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("✅ Gemini API Response:", response.data);

    if (response.data && response.data.candidates) {
      res.json({ advice: response.data.candidates[0]?.content || "No advice available." });
    } else {
      res.status(500).json({ error: "Unexpected response from Gemini API." });
    }
  } catch (error) {
    console.error("❌ Gemini API Request Failed:");
    console.error("Error Message:", error.message);
    console.error("Response Data:", error.response?.data);
    console.error("Status Code:", error.response?.status);

    res.status(500).json({ error: "Failed to fetch advice from Gemini AI." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
