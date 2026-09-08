import { GoogleGenAI } from "@google/genai";

export function getAiClient(req: any) {
  let customKey = req.headers['x-gemini-api-key'] as string;
  if (customKey) {
    try {
      customKey = decodeURIComponent(customKey);
    } catch (e) {
      // Ignore invalid decode
    }
  }
  
  let apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key");
  }
  
  // Remove any non-ASCII characters or whitespace that might have been accidentally pasted
  apiKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();
  
  return new GoogleGenAI({ apiKey });
}

export async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  
  let lastError: any;
  for (const model of models) {
    try {
      console.log(`Trying model ${model}...`);
      const payload = { ...payloadOptions, model };
      const response = await client.models.generateContent(payload);
      return response;
    } catch (error: any) {
      console.error(`Model ${model} failed:`, error?.message);
      lastError = error;
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429 || errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503 || error?.status === 500 || error?.status === 404 || errorMsg.includes("no longer available")) {
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
