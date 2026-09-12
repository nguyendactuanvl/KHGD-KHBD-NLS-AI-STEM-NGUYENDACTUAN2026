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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
  let primaryError: any = null;
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const model of models) {
      try {
        console.log(`Trying model ${model} (attempt ${attempt + 1})...`);
        return await client.models.generateContent({ ...payloadOptions, model });
      } catch (error: any) {
        console.error(`Model ${model} failed:`, error?.message);
        const errorMsg = error?.message || "";
        const status = error?.status;
        
        if (
          errorMsg.includes("429") || status === 429 || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") ||
          errorMsg.includes("503") || status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded") ||
          error?.status === 500 || errorMsg.includes("no longer available")
        ) {
          if (!primaryError) primaryError = error;
          continue; 
        }
        if (errorMsg.includes("not found") || status === 404) {
          continue;
        }
        throw error;
      }
    }
    if (primaryError && attempt < maxRetries - 1) {
      console.warn(`Attempt ${attempt + 1} failed with Quota/Overload. Retrying in ${3000 * (attempt + 1)}ms...`);
      await delay(3000 * (attempt + 1) + Math.random() * 1000);
    }
  }
  throw primaryError;
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { file, type } = req.body;
      let promptText = "";
      let responseSchema;
      
      if (type === "timetable") {
        promptText = `Trích xuất Thời khóa biểu từ tài liệu. Hệ thống tiết học: Sáng (tiết 1, 2, 3, 4, 5), Chiều (tiết 6, 7, 8, 9, 10), Tối (tiết Tối).
Nếu trong tài liệu ghi buổi chiều tiết 1,2,3,4,5 thì tự động chuyển đổi thành tiết 6,7,8,9,10.
Trả về danh sách các tiết học/lịch công tác.`;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            entries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "Ví dụ: Thứ 2, Thứ 3..." },
                  period: { type: Type.STRING, description: "Từ 1 đến 10, hoặc 'Tối'" },
                  content: { type: Type.STRING }
                },
                required: ["day", "period", "content"]
              }
            }
          },
          required: ["entries"]
        };
      } else if (type === "student_profiles") {
        promptText = "Trích xuất danh sách học sinh kèm thông tin liên lạc từ tài liệu đính kèm. Bỏ qua tiêu đề. Lấy họ tên, ngày sinh, số điện thoại học sinh, họ tên phụ huynh, số điện thoại phụ huynh, địa chỉ, ghi chú (nếu có).";
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            students: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dob: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  parentName: { type: Type.STRING },
                  parentPhone: { type: Type.STRING },
                  address: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name"]
              }
            }
          },
          required: ["students"]
        };
      } else if (type === "students") {
        promptText = "Trích xuất danh sách họ và tên học sinh từ tài liệu đính kèm. Bỏ qua các tiêu đề, STT, cột điểm, chỉ lấy họ và tên.";
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            students: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["students"]
        };
      } else {
        throw new Error("Invalid extract type");
      }
      
      const matches = file.match(/^data:([a-zA-Z0-9\/\+\-\.]+);base64,(.+)$/);
      if (!matches) throw new Error("Invalid file format");
      
      const parts = [
        { text: promptText },
        {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        }
      ];
      
      const payloadOptions = {
        contents: [{ role: "user", parts }],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema
        }
      };

      const response = await generateWithFallback(req, payloadOptions);
      if (!response || !response.text) throw new Error("No response from AI");
      
      let parsed;
      try {
        parsed = JSON.parse(response.text);
      } catch(e) {
        const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      }
      
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to extract data" });
    }
}
