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
      const { lesson, subject, files, textbook } = req.body;
      const textbookName = textbook || "Kết nối tri thức với cuộc sống";
      
      const prompt = `Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Tôi đã tải lên một tài liệu Kế hoạch giáo dục (KHGD).
Dựa vào các tài liệu được cung cấp (Sách, Văn bản, KHDH...), hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn ${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}".
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "${textbookName}".
Trích xuất các thông tin về:
- Số tiết (phân bổ thời gian cho bài học này)
- Yêu cầu cần đạt
- Năng lực số
- Năng lực AI
- Tích hợp STEM/STEAM
của chính bài học đó. Sau đó, sử dụng các thông tin này để soạn chi tiết một Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học đó.

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Phân chia tiết học**: BẮT BUỘC dựa vào số tiết trích xuất được để phân bổ rõ ràng tiến trình dạy học. Ví dụ bài có 2 tiết thì phải ghi rõ "Tiết 1: ... (45 phút)", "Tiết 2: ... (45 phút)". Mỗi tiết đảm bảo thời lượng đúng 45 phút.
2. **Tuyệt đối KHÔNG sử dụng thẻ HTML \`<br>\` hoặc \`<br/>\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
3. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\` để tô màu xanh nổi bật.
4. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Sử dụng duy nhất dấu $ cho công thức trong dòng (ví dụ: $a+b=c$) và $$ cho công thức riêng (ví dụ: $x^2$). Không dùng các ký tự Unicode mô phỏng công thức.
5. **Bảng biểu**: Sử dụng chuẩn bảng Markdown đẹp mắt (Markdown tables) để phân chia rõ ràng Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.
6. **I. MỤC TIÊU**: Trình bày rõ ràng Kiến thức, Năng lực số, Năng lực AI, và Yêu cầu STEM. Các mã chỉ báo (như [3.1.NC1a]) phải được giữ nguyên và giải thích ngắn gọn cách đạt được trong bài.
7. **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**: Ghi rõ các thiết bị số, phần mềm, công cụ AI cần thiết.
8. **III. TIẾN TRÌNH DẠY HỌC**:
   Trình bày tiến trình giảng dạy rõ ràng theo từng tiết (Tiết 1, Tiết 2...). Phải thiết kế theo 4 hoạt động chuẩn: 
   - Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập.
   - Hoạt động 2: Hình thành kiến thức mới.
   - Hoạt động 3: Luyện tập.
   - Hoạt động 4: Vận dụng.
   Mỗi hoạt động phải trình bày rõ ràng bằng BẢNG (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện). Đặc biệt, lồng ghép khéo léo việc sử dụng phần mềm, kỹ năng số, hoặc ứng dụng AI vào phần "Tổ chức thực hiện".
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế. Nếu không tìm thấy bài học trong tài liệu, hãy thông báo lỗi nhẹ nhàng và soạn một giáo án dự kiến.`;;

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
      console.error("AI File Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("Unsupported MIME type")) {
        return res.status(400).json({ error: "Định dạng file không được AI hỗ trợ. Vui lòng chuyển file sang định dạng PDF và thử lại." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate lesson plan from file" });
    }
}
