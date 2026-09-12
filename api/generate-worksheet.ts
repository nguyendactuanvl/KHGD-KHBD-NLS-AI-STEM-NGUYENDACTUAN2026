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
      const { lesson, subject, grade, type } = req.body;
      
      const prompt = `Bạn là một giáo viên xuất sắc môn ${subject || "chung"}. Hãy tạo một Phiếu học tập (Worksheet) thật chuyên nghiệp, trực quan cho học sinh lớp ${grade}, bài học/chủ đề: "${lesson}".
      
      YÊU CẦU:
      1. Phần đầu: Tiêu đề phiếu học tập, Họ và tên học sinh, Lớp, Ngày.
      2. Tóm tắt kiến thức trọng tâm (ngắn gọn, dễ hiểu, dùng bảng biểu nếu cần).
      3. Hệ thống bài tập:
         - Hình thức: ${type || "Kết hợp trắc nghiệm và tự luận"}.
         - Phân hóa từ cơ bản đến vận dụng.
      4. Trình bày rõ ràng, để lại khoảng trống hợp lý giả định học sinh sẽ làm trực tiếp vào phiếu.
      5. ĐỐI VỚI CÁC MÔN KHOA HỌC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức. TẤT CẢ các biến số (như $x, V$), giá trị (như $500\text{ cm}^3$) ĐỀU PHẢI bọc trong dấu $. Sử dụng duy nhất dấu $ cho công thức trong dòng và $ cho công thức riêng.
      6. ĐÁP ÁN: Ở cuối tài liệu, hãy cung cấp phần Hướng dẫn giải/Đáp án, phân cách bằng một tiêu đề thật rõ ràng (ví dụ: "--- HƯỚNG DẪN CHẤM / ĐÁP ÁN ---") để giáo viên có thể cắt/xóa trước khi in cho học sinh.`;

      const response = await generateWithFallback(req, {
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate worksheet" });
    }
}
