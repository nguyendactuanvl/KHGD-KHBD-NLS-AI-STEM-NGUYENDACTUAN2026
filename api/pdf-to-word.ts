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
  const models = ["gemini-3.6-flash", "gemini-3.1-pro-preview"];
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
      res.status(500).json({ error: error.message || "Failed to convert document" });
    }
}
