const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log("Testing Gemini API key...\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say hello in one sentence");

    console.log("✓ Gemini API Key is WORKING!");
    console.log("\nResponse:", result.response.text());
    console.log("\n✓ Your Gemini integration is ready!");
  } catch (error) {
    console.error("✗ Gemini API Key FAILED:", error.message);
    console.error("\nPlease check:");
    console.error("1. Your API key in .env.local");
    console.error(
      "2. API key is enabled at https://aistudio.google.com/apikey"
    );
    console.error("3. Billing is set up if required");
  }
}

testGemini();
