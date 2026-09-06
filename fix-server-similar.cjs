const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const solvePos = code.indexOf('app.post("/api/solve-exercise"');

const generateSimilarRoute = `
  app.post("/api/generate-similar", async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = \`Bạn là một chuyên gia giáo dục. Dưới đây là bài tập, đề thi hoặc tài liệu mà giáo viên cung cấp.
YÊU CẦU:
1. Đọc và phân tích cấu trúc, độ khó, dạng bài, và kiến thức trọng tâm của tài liệu gốc.
2. TẠO RA MỘT ĐỀ BÀI HOẶC BỘ BÀI TẬP TƯƠNG TỰ (cùng cấu trúc, độ khó, và dạng bài nhưng thay đổi số liệu, ngữ cảnh hoặc cách hỏi).
3. CUNG CẤP LỜI GIẢI CHI TIẾT cho ĐỀ TƯƠNG TỰ vừa tạo.

Định dạng đầu ra rõ ràng:
## Đề bài tương tự
[Nội dung đề vừa tạo]

## Lời giải chi tiết
[Các bước giải chi tiết cho đề tương tự]

LƯU Ý ĐỐI VỚI CÔNG THỨC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học, lý, hóa. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng. KHÔNG sử dụng ký tự Unicode mô phỏng công thức.\`;

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
      
      res.json({ result: response });
    } catch (error: any) {
      console.error("Error generating similar exercise:", error);
      res.status(500).json({ error: error.message || "Failed to generate similar exercise" });
    }
  });
`;

code = code.substring(0, solvePos) + generateSimilarRoute + "\n" + code.substring(solvePos);
fs.writeFileSync('server.ts', code);
console.log("Updated server.ts with /api/generate-similar");
