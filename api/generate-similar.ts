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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = `Bạn là một chuyên gia giáo dục. Dưới đây là bài tập, đề thi hoặc tài liệu mà giáo viên cung cấp.
YÊU CẦU:
1. Đọc và phân tích cấu trúc, độ khó, dạng bài, và kiến thức trọng tâm của tài liệu gốc.
2. TẠO RA MỘT ĐỀ BÀI HOẶC BỘ BÀI TẬP TƯƠNG TỰ (cùng cấu trúc, độ khó, và dạng bài nhưng thay đổi số liệu, ngữ cảnh hoặc cách hỏi).
3. CUNG CẤP LỜI GIẢI CHI TIẾT cho ĐỀ TƯƠNG TỰ vừa tạo.

Định dạng đầu ra rõ ràng:
## Đề bài tương tự
[Nội dung đề vừa tạo]

## Lời giải chi tiết
[Các bước giải chi tiết cho đề tương tự]

LƯU Ý ĐỐI VỚI CÔNG THỨC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học, lý, hóa. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng. KHÔNG sử dụng ký tự Unicode mô phỏng công thức.`;

      const response = await generateWithFallback(req, {
        contents: [
          {
            role: "user",
            parts: [
              ...(files || []).map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          temperature: 0.7,
        }
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error generating similar exercise:", error);
      res.status(500).json({ error: error.message || "Failed to generate similar exercise" });
    }
}
