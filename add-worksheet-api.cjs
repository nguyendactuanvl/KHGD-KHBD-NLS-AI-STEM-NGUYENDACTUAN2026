const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const apiCode = `
  // API route to generate Worksheet (Phiếu học tập)
  app.post("/api/generate-worksheet", async (req, res) => {
    try {
      const { lesson, subject, grade, type } = req.body;
      
      const prompt = \`Bạn là một giáo viên xuất sắc môn \${subject || "chung"}. Hãy tạo một Phiếu học tập (Worksheet) thật chuyên nghiệp, trực quan cho học sinh lớp \${grade}, bài học/chủ đề: "\${lesson}".
      
      YÊU CẦU:
      1. Phần đầu: Tiêu đề phiếu học tập, Họ và tên học sinh, Lớp, Ngày.
      2. Tóm tắt kiến thức trọng tâm (ngắn gọn, dễ hiểu, dùng bảng biểu nếu cần).
      3. Hệ thống bài tập:
         - Hình thức: \${type || "Kết hợp trắc nghiệm và tự luận"}.
         - Phân hóa từ cơ bản đến vận dụng.
      4. Trình bày rõ ràng, để lại khoảng trống hợp lý giả định học sinh sẽ làm trực tiếp vào phiếu.
      5. ĐỐI VỚI CÁC MÔN KHOA HỌC (Toán, Lý, Hóa, Sinh, Tin học): BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học, phương trình phản ứng, hoặc biểu thức. Sử dụng dấu \`$\` cho công thức trong dòng và \`$$\` cho công thức trên một dòng riêng.
      6. ĐÁP ÁN: Ở cuối tài liệu, hãy cung cấp phần Hướng dẫn giải/Đáp án, phân cách bằng một tiêu đề thật rõ ràng (ví dụ: "--- HƯỚNG DẪN CHẤM / ĐÁP ÁN ---") để giáo viên có thể cắt/xóa trước khi in cho học sinh.\`;

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

  // API route to check circulars`;

code = code.replace("// API route to check circulars", apiCode);
fs.writeFileSync('server.ts', code);
console.log("Success");
