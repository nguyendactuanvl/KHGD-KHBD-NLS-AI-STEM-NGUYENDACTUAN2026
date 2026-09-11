const { GoogleGenAI } = require("@google/genai");

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({ model: "gemini-3.1-pro-preview", contents: "Hi" });
    console.log(res.text);
  } catch(e) {
    console.error("ERROR:", e.status, e.message);
  }
}
test();
