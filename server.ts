import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route to generate Educational Plan (KHGD) suggestions
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { subject, grade, topic } = req.body;
      
      const prompt = `Bạn là một Tổ trưởng chuyên môn và chuyên gia giáo dục. Hãy tạo/bổ sung một mẫu Kế hoạch giáo dục (KHGD) cho môn ${subject}, lớp ${grade}, chủ đề "${topic}".
      Giữ nguyên cấu trúc KHGD gốc (của công văn 5512/BGDĐT-GDTrH) và chỉ bổ sung các cột còn thiếu theo yêu cầu chuẩn của các công văn mới nhất về Năng lực số (NLS) (CV 3456) và Năng lực AI (QĐ 2422).
      
      YÊU CẦU BẮT BUỘC ĐỐI VỚI NỘI DUNG:
      - Cột "Năng lực số": BẮT BUỘC phải bắt đầu bằng mã chỉ báo cụ thể trong dấu ngoặc vuông (ví dụ: [1.1.NC1a], [3.1.NC1a], [5.3.NC1b]...). Theo sau là nội dung ứng dụng. Ví dụ: "[3.1.NC1a] Sử dụng công cụ vẽ số hóa biểu đồ".
      - Cột "Năng lực AI": BẮT BUỘC phải bắt đầu bằng mã chỉ báo cụ thể trong dấu ngoặc vuông theo QĐ 2422 (ví dụ: [10.A1.1], [10.C2.1], [12.D2.1]...). Theo sau là yêu cầu cần đạt về AI tương ứng.
      - Cột "Giáo dục STEM/STEAM": Đề xuất hợp lý nhất các bài có thể tích hợp Stem/Steam phù hợp với năng lực và điều kiện thực tế.
      - Giữ nguyên các cột gốc: Bài học, Số tiết/bài, Yêu cầu cần đạt.
      
      Trả về kết quả dưới dạng danh sách JSON array với các thuộc tính: lesson, periods, requirement, digitalComp, aiComp, stem, note.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
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
    } catch (error) {
      console.error("AI Generation error:", error);
      res.status(500).json({ error: "Failed to generate plan" });
    }
  });

  // API route to generate Detailed Lesson Plan (Kế hoạch bài dạy)
  app.post("/api/generate-lesson-plan", async (req, res) => {
    try {
      const { lesson, requirement, digitalComp, aiComp, stem, grade } = req.body;
      
    const prompt = `Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}" (Khối lớp ${grade}).

Dựa vào các dữ liệu bắt buộc sau từ Kế hoạch giáo dục:
- Yêu cầu cần đạt: ${requirement || "Không có yêu cầu đặc thù"}
- Năng lực số (theo CV 3456): ${digitalComp || "Không áp dụng"}
- Năng lực AI (theo QĐ 2422): ${aiComp || "Không áp dụng"}
- Tích hợp STEM/STEAM: ${stem || "Không áp dụng"}

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Tuyệt đối KHÔNG sử dụng thẻ HTML \`<br>\` hoặc \`<br/>\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
2. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\` để tô màu xanh nổi bật.
3. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Đặt công thức trên cùng 1 dòng trong cặp dấu \`$\` (ví dụ: $x^2 + y^2 = R^2$), hoặc trên 1 dòng riêng trong cặp dấu \`$$\` (ví dụ: \`$$\\int f(x)dx$$\`). Không dùng các ký tự Unicode mô phỏng công thức.
4. **Bảng biểu**: Sử dụng chuẩn bảng Markdown đẹp mắt (Markdown tables) để phân chia rõ ràng Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.
5. **Hình vẽ minh họa**: Hãy chèn 1-2 hình ảnh minh họa sinh động (sơ đồ, đồ thị) bằng Markdown. Dùng cú pháp: \`![Mô tả](https://image.pollinations.ai/prompt/{tu_khoa_tieng_anh}?width=800&height=400&nologo=true)\`. Thay \`{tu_khoa_tieng_anh}\` bằng mô tả ảnh chi tiết bằng TIẾNG ANH (dùng %20 thay khoảng trắng).
6. **I. MỤC TIÊU**: Trình bày rõ ràng Kiến thức, Năng lực số, Năng lực AI, và Yêu cầu STEM. Các mã chỉ báo (như [3.1.NC1a]) phải được giữ nguyên và giải thích ngắn gọn cách đạt được trong bài.
7. **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**: Ghi rõ các thiết bị số, phần mềm, công cụ AI cần thiết.
8. **III. TIẾN TRÌNH DẠY HỌC**:
   Phải thiết kế theo 4 hoạt động chuẩn: 
   - Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập.
   - Hoạt động 2: Hình thành kiến thức mới.
   - Hoạt động 3: Luyện tập.
   - Hoạt động 4: Vận dụng.
   Mỗi hoạt động phải trình bày rõ ràng bằng BẢNG (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện). Đặc biệt, lồng ghép khéo léo việc sử dụng phần mềm, kỹ năng số, hoặc ứng dụng AI vào phần "Tổ chức thực hiện".
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải do nhu cầu sử dụng cao. Vui lòng thử lại sau vài giây." });
      }
      res.status(500).json({ error: "Failed to generate lesson plan" });
    }
  });

  // API route to generate Detailed Lesson Plan from uploaded file
  app.post("/api/generate-lesson-plan-file", async (req, res) => {
    try {
      const { lesson, fileData, fileMimeType } = req.body;
      
      const prompt = `Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Tôi đã tải lên một tài liệu Kế hoạch giáo dục (KHGD).
Hãy tìm trong tài liệu này bài học có tên (hoặc gần giống với): "${lesson}".
Trích xuất các thông tin về:
- Yêu cầu cần đạt
- Năng lực số
- Năng lực AI
- Tích hợp STEM/STEAM
của chính bài học đó. Sau đó, sử dụng các thông tin này để soạn chi tiết một Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học đó.

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Tuyệt đối KHÔNG sử dụng thẻ HTML \`<br>\` hoặc \`<br/>\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
2. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\` để tô màu xanh nổi bật.
3. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Đặt công thức trên cùng 1 dòng trong cặp dấu \`$\` (ví dụ: $x^2 + y^2 = R^2$), hoặc trên 1 dòng riêng trong cặp dấu \`$$\` (ví dụ: \`$$\\int f(x)dx$$\`). Không dùng các ký tự Unicode mô phỏng công thức.
4. **Bảng biểu**: Sử dụng chuẩn bảng Markdown đẹp mắt (Markdown tables) để phân chia rõ ràng Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.
5. **Hình vẽ minh họa**: Hãy chèn 1-2 hình ảnh minh họa sinh động (sơ đồ, đồ thị) bằng Markdown. Dùng cú pháp: \`![Mô tả](https://image.pollinations.ai/prompt/{tu_khoa_tieng_anh}?width=800&height=400&nologo=true)\`. Thay \`{tu_khoa_tieng_anh}\` bằng mô tả ảnh chi tiết bằng TIẾNG ANH (dùng %20 thay khoảng trắng).
6. **I. MỤC TIÊU**: Trình bày rõ ràng Kiến thức, Năng lực số, Năng lực AI, và Yêu cầu STEM. Các mã chỉ báo (như [3.1.NC1a]) phải được giữ nguyên và giải thích ngắn gọn cách đạt được trong bài.
7. **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**: Ghi rõ các thiết bị số, phần mềm, công cụ AI cần thiết.
8. **III. TIẾN TRÌNH DẠY HỌC**:
   Phải thiết kế theo 4 hoạt động chuẩn: 
   - Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập.
   - Hoạt động 2: Hình thành kiến thức mới.
   - Hoạt động 3: Luyện tập.
   - Hoạt động 4: Vận dụng.
   Mỗi hoạt động phải trình bày rõ ràng bằng BẢNG (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện). Đặc biệt, lồng ghép khéo léo việc sử dụng phần mềm, kỹ năng số, hoặc ứng dụng AI vào phần "Tổ chức thực hiện".
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế. Nếu không tìm thấy bài học trong tài liệu, hãy thông báo lỗi nhẹ nhàng và soạn một giáo án dự kiến.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: fileData,
                  mimeType: fileMimeType
                }
              },
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
      if (errorMsg.includes("Unsupported MIME type")) {
        return res.status(400).json({ error: "Định dạng file không được AI hỗ trợ. Vui lòng chuyển file sang định dạng PDF và thử lại." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải do nhu cầu sử dụng cao. Vui lòng thử lại sau vài giây." });
      }
      res.status(500).json({ error: "Failed to generate lesson plan from file" });
    }
  });

  // API route to check circulars
  app.get("/api/circulars", (req, res) => {
    res.json([
      { id: "5512/BGDĐT-GDTrH", date: "18/12/2020", title: "Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường" },
      { id: "3456/BGDĐT-GDPT", date: "27/6/2025", title: "Hướng dẫn triển khai thực hiện khung năng lực số cho học sinh phổ thông" },
      { id: "2422/QĐ-BGDĐT", date: "18/8/2026", title: "Ban hành Khung nội dung giáo dục trí tuệ nhân tạo cho học sinh phổ thông" }
    ]);
  });

  // Vite middleware for development
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
