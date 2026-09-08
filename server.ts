import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

function getAiClient(req: express.Request) {
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

// Helper function to bypass quota limits by using fallback models
async function generateWithFallback(req: express.Request, payloadOptions: any) {
  const client = getAiClient(req);
  const models = ["gemini-3.6-flash", "gemini-3.1-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
  
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

const sharedExamsStore = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route to generate Educational Plan (KHGD) suggestions
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { subject, grade, topic, files } = req.body;
      
      const prompt = `Bạn là một Tổ trưởng chuyên môn và chuyên gia giáo dục. Hãy tạo/bổ sung một mẫu Kế hoạch giáo dục (KHGD) cho môn ${subject}, lớp ${grade}, chủ đề "${topic}".
      Giữ nguyên cấu trúc KHGD gốc (của công văn 5512/BGDĐT-GDTrH) và chỉ bổ sung các cột còn thiếu theo yêu cầu chuẩn của các công văn mới nhất về Năng lực số (NLS) (CV 3456) và Năng lực AI (QĐ 2422).
      
      YÊU CẦU BẮT BUỘC ĐỐI VỚI NỘI DUNG:
      - Cột "Năng lực số": BẮT BUỘC phải bắt đầu bằng mã chỉ báo cụ thể trong dấu ngoặc vuông (ví dụ: [1.1.NC1a], [3.1.NC1a], [5.3.NC1b]...). Theo sau là nội dung ứng dụng. Ví dụ: "[3.1.NC1a] Sử dụng công cụ vẽ số hóa biểu đồ".
      - Cột "Năng lực AI": BẮT BUỘC phải bắt đầu bằng mã chỉ báo cụ thể trong dấu ngoặc vuông theo QĐ 2422 (ví dụ: [10.A1.1], [10.C2.1], [12.D2.1]...). Theo sau là yêu cầu cần đạt về AI tương ứng.
      - Cột "Giáo dục STEM/STEAM": Đề xuất hợp lý nhất các bài có thể tích hợp Stem/Steam phù hợp với năng lực và điều kiện thực tế.
      - Giữ nguyên các cột gốc: Bài học, Số tiết/bài, Yêu cầu cần đạt.
      
      Trả về kết quả dưới dạng danh sách JSON array với các thuộc tính: lesson, periods, requirement, digitalComp, aiComp, stem, note.`;

      let contents: any = prompt;
      if (files && files.length > 0) {
        contents = [
          {
            role: "user",
            parts: [
              ...files.map((f: any) => ({
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
        ];
      }
      const response = await generateWithFallback(req, {
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lesson: { type: Type.STRING },
                periods: { type: Type.NUMBER },
                requirement: { type: Type.STRING },
                digitalComp: { type: Type.STRING },
                aiComp: { type: Type.STRING },
                stem: { type: Type.STRING },
                note: { type: Type.STRING }
              },
              required: ["lesson", "periods", "requirement", "digitalComp", "aiComp", "stem", "note"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      res.json(data);
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
      res.status(500).json({ error: "Failed to generate plan" });
    }
  });

  // API route to generate Detailed Lesson Plan (Kế hoạch bài dạy)
  app.post("/api/generate-lesson-plan", async (req, res) => {
    try {
            const { lesson, requirement, digitalComp, aiComp, stem, grade, subject, periods } = req.body;
    
      const prompt = `Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn ${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}" (Khối lớp ${grade}).

Dựa vào các dữ liệu bắt buộc sau từ Kế hoạch giáo dục:
- Số tiết: ${periods || "1"} tiết (Mỗi tiết chuẩn đúng 45 phút)
- Yêu cầu cần đạt: ${requirement || "Không có yêu cầu đặc thù"}
- Năng lực số (theo CV 3456): ${digitalComp || "Không áp dụng"}
- Năng lực AI (theo QĐ 2422): ${aiComp || "Không áp dụng"}
- Tích hợp STEM/STEAM: ${stem || "Không áp dụng"}

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Phân chia tiết học**: BẮT BUỘC phải phân bổ rõ ràng tiến trình dạy học thành ${periods || "1"} tiết học. Mỗi tiết phải ghi rõ "Tiết 1: ... (45 phút)", "Tiết 2: ... (45 phút)", v.v... đảm bảo khối lượng nội dung và các hoạt động vừa vặn cho đúng 45 phút/tiết.
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
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế.`;

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
      res.status(500).json({ error: "Failed to generate lesson plan" });
    }
  });

  // API route to generate Detailed Lesson Plan from uploaded file
  app.post("/api/generate-lesson-plan-file", async (req, res) => {
    try {
      const { lesson, subject, files } = req.body;
      
      const prompt = `Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Tôi đã tải lên một tài liệu Kế hoạch giáo dục (KHGD).
Dựa vào các tài liệu được cung cấp (Sách, Văn bản, KHDH...), hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn ${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}".
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
  });

  // API route to generate Worksheet (Phiếu học tập)
  app.post("/api/generate-worksheet", async (req, res) => {
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
  });

  // API route to check circulars
  
  // API route to solve exercises
  
  app.post("/api/generate-similar", async (req, res) => {
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
  });


  app.post("/api/pdf-to-word", async (req, res) => {
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
  });

app.post("/api/solve-exercise", async (req, res) => {
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
  });

app.get("/api/circulars", (req, res) => {
    res.json([
      { id: "5512/BGDĐT-GDTrH", date: "18/12/2020", title: "Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường" },
      { id: "3456/BGDĐT-GDPT", date: "27/6/2025", title: "Hướng dẫn triển khai thực hiện khung năng lực số cho học sinh phổ thông" },
      { id: "2422/QĐ-BGDĐT", date: "18/8/2026", title: "Ban hành Khung nội dung giáo dục trí tuệ nhân tạo cho học sinh phổ thông" }
    ]);
  });

  // Vite middleware for development

  app.post("/api/extract-data", express.json({limit: '50mb'}), async (req, res) => {
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
      
      const matches = file.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
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
        generationConfig: {
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
  });

  app.post("/api/generate-exam", express.json({limit: '20mb'}), async (req, res) => {
    try {
      const { subject, grade, duration, examType, matrix, customPrompt, qCounts, matrixFile, selectedTopics } = req.body;
      
      const isMath = subject.toLowerCase().includes('toán');
      
      let mathPrompt = "";
      let total = 20;
      
      if (isMath) {
        total = (qCounts.mc || 0) + (qCounts.tf || 0) + (qCounts.sa || 0) + (qCounts.essay || 0);
        mathPrompt = `Cấu trúc đề Toán yêu cầu:
- Trắc nghiệm nhiều lựa chọn (mc): ${qCounts.mc} câu.
- Trắc nghiệm Đúng/Sai (tf): ${qCounts.tf} câu (Mỗi câu gồm 1 mệnh đề chính và 4 ý a,b,c,d để học sinh chọn đúng/sai).
- Trắc nghiệm trả lời ngắn (sa): ${qCounts.sa} câu.
- Tự luận (essay): ${qCounts.essay} câu.
`;
        if (selectedTopics && selectedTopics.length > 0) {
          mathPrompt += `
Các chủ đề cần tập trung (lấy từ KHGD): ${selectedTopics.join(", ")}
`;
        }
      } else {
        total = req.body.totalQuestions || 20;
        mathPrompt = `Cấu trúc: ${total} câu trắc nghiệm nhiều lựa chọn (mc).`;
      }
      
      const promptText = `Hãy tạo một đề kiểm tra môn ${subject} lớp ${grade}.
Thời gian làm bài: ${duration || 45} phút. Loại bài kiểm tra: ${examType === '15p' ? '15 phút' : examType === '45p' ? '1 tiết' : examType === 'mid' ? 'Giữa kỳ' : 'Cuối kỳ'}.

Yêu cầu cấu trúc:
${mathPrompt}

${matrix ? "Ma trận người dùng nhập: " + matrix : ""}
${customPrompt ? "Yêu cầu thêm: " + customPrompt : ""}
${matrixFile ? "Người dùng có đính kèm một file ma trận (đã đính kèm). Vui lòng bám sát cấu trúc trong file đó." : ""}

Hãy trả về định dạng JSON nghiêm ngặt với cấu trúc như sau:
{
  "examName": "Tên đề kiểm tra (ví dụ: Đề kiểm tra giữa kì 1 Toán 9)",
  "questions": [
    {
      "id": 1,
      "type": "mc", // mc (Trắc nghiệm), tf (Đúng sai), sa (Trả lời ngắn), essay (Tự luận)
      "content": "Nội dung câu hỏi (chứa cả các ý a, b, c, d nếu là Đúng Sai)",
      "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"], // Chỉ dùng cho type="mc"
      "correctOptionIndex": 0, // Chỉ dùng cho type="mc"
      "correctAnswer": "Giải thích hoặc đáp án cho các loại câu khác", // Dùng cho tf, sa, essay (VD tf: "Đ,S,Đ,S")
      "level": "Nhận biết"
    }
  ]
}
Chú ý: Nội dung câu hỏi KHÔNG BAO GỒM các tiền tố như "Câu 1:". Mọi công thức toán học phải bọc trong dấu $ (ví dụ $x^2 + 1$).
`;
      
      const parts = [{ text: promptText }];
      
      if (matrixFile) {
        // matrixFile is data URI: data:image/png;base64,....
        const matches = matrixFile.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
      
      const payloadOptions = {
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              examName: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.NUMBER },
                    correctAnswer: { type: Type.STRING },
                    level: { type: Type.STRING }
                  },
                  required: ["id", "type", "content", "level"]
                }
              }
            },
            required: ["examName", "questions"]
          }
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
      res.status(500).json({ error: error.message || "Failed to generate exam" });
    }
  });

  app.post("/api/exams/share", express.json({limit: '10mb'}), (req, res) => {
    try {
      const { examData, codes } = req.body;
      const examId = Math.random().toString(36).substring(2, 10);
      sharedExamsStore.set(examId, { examData, codes, createdAt: Date.now() });
      res.json({ examId });
    } catch(e) {
      res.status(500).json({ error: "Failed to share exam" });
    }
  });

  app.get("/api/exams/:id", (req, res) => {
    const data = sharedExamsStore.get(req.params.id);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: "Exam not found" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
