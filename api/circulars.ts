import { Type, GoogleGenAI } from "@google/genai";



function getAiClient(req: any) {
  let customKey = req.headers['x-gemini-api-key'] as string;
  if (customKey) {
    try {
      customKey = decodeURIComponent(customKey);
    } catch (e) {
    }
  }
  let apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");
  apiKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();
  return new GoogleGenAI({ apiKey });
}

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError: any;
  for (const model of models) {
    try {
      console.log('Trying model ' + model + '...');
      const payload = { ...payloadOptions, model };
      return await client.models.generateContent(payload);
    } catch (error: any) {
      console.error('Model ' + model + ' failed:', error?.message);
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

const sharedExamsStore = new Map();

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    res.json([
      { id: "5512/BGDĐT-GDTrH", date: "18/12/2020", title: "Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường" },
      { id: "3456/BGDĐT-GDPT", date: "27/6/2025", title: "Hướng dẫn triển khai thực hiện khung năng lực số cho học sinh phổ thông" },
      { id: "2422/QĐ-BGDĐT", date: "18/8/2026", title: "Ban hành Khung nội dung giáo dục trí tuệ nhân tạo cho học sinh phổ thông" }
    ]);
}
