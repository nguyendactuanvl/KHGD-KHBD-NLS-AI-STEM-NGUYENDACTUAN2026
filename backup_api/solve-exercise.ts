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
        
        return await client.models.generateContent({ ...payloadOptions, model });
      } catch (error: any) {
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
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = `Bạn là một giáo viên xuất sắc. Dưới đây là bài tập hoặc tài liệu học sinh đưa ra. 
YÊU CẦU:
1. Đọc nội dung bài tập từ file.
2. Viết lại đề bài rõ ràng.
3. Cung cấp lời giải chi tiết, giải thích cặn kẽ từng bước để học sinh dễ hiểu.
4. Định dạng đầu ra thành 2 phần rõ rệt (dùng tiêu đề H2):
## Đề bài
[Nội dung đề]

## Lời giải chi tiết
[Các bước giải chi tiết]

5. ĐỐI VỚI CÁC MÔN KHOA HỌC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức. TẤT CẢ các biến số (như $x, V$), giá trị (như $500\text{ cm}^3$) ĐỀU PHẢI bọc trong dấu $. Sử dụng duy nhất dấu $ cho công thức trong dòng và $ cho công thức riêng.`;

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
          temperature: 0.2,
        }
      });
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Solve Exercise error:", error);
      res.status(500).json({ error: "Lỗi trong quá trình giải bài tập: " + (error?.message || "Lỗi không xác định") });
    }
}
