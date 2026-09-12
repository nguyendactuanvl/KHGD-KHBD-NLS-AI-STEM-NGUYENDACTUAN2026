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

      const prompt = `Bạn là một chuyên gia số hóa tài liệu. Nhiệm vụ của bạn là chuyển đổi TOÀN BỘ nội dung trong tài liệu (ảnh/PDF) được cung cấp sang định dạng văn bản (Markdown).

YÊU CẦU NGHIÊM NGẶT:
1. TUYỆT ĐỐI GIỮ NGUYÊN cấu trúc, số thứ tự câu, các mục lục, phân chương phân bài. Không được tự ý tóm tắt hay lược bỏ bất kỳ từ nào.
2. CHUYỂN TOÀN BỘ CÔNG THỨC, KÝ HIỆU Toán học, Vật lý, Hóa học sang định dạng chuẩn LaTeX:
   - TẤT CẢ các biến số (VD: $x, y, V, S$), các giá trị đại lượng (VD: $500\text{ cm}^3, 50\text{ kg}$), biểu thức, phương trình ĐỀU PHẢI được bọc trong dấu $.
   - Sử dụng một dấu $ (VD: $x^2 + 1 = 0$) cho công thức/ký hiệu nằm trong dòng chữ.
   - Sử dụng hai dấu $ (VD: $\int_0^1 x dx$) cho công thức đứng riêng một dòng.
   - KHÔNG dùng ký tự Unicode mô phỏng công thức (như x² hay ½).
3. HÌNH ẢNH / HÌNH VẼ: Do hạn chế kỹ thuật số hóa, nếu gặp biểu đồ, hình vẽ, đồ thị, hãy thêm một chú thích rõ ràng bằng chữ ở vị trí đó (Ví dụ: [Hình vẽ đồ thị hàm số...] hoặc [Hình ảnh mô tả...]) để giáo viên biết vị trí cần chèn lại ảnh gốc.
4. GIỮ NGUYÊN BẢNG BIỂU: Dùng cú pháp Markdown table để tạo lại chính xác các bảng biểu trong tài liệu.
5. Nếu trong tài liệu gốc có các thẻ HTML (như <img>) được truyền vào, TUYỆT ĐỐI GIỮ NGUYÊN Y HỆT các thẻ đó ở đúng vị trí.

Đầu ra của bạn phải hoàn toàn là nội dung tài liệu đã được số hóa, không thêm các câu chào hỏi thừa.`;

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
          temperature: 0.1,
        }
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error converting pdf to word:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
      }
      return res.status(500).json({ error: "Có lỗi xảy ra trong quá trình số hóa tài liệu. Vui lòng thử lại." });
    }
}
}
