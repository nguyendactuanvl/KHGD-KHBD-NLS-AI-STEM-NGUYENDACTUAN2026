const fs = require('fs');

const filePath = 'server.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const insertPos = code.lastIndexOf("app.get(\"/api/circulars\"");
if (insertPos !== -1) {
    const endpointCode = `
  // API route to solve exercises
  app.post("/api/solve-exercise", async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = \`Bạn là một giáo viên xuất sắc. Dưới đây là bài tập hoặc tài liệu học sinh đưa ra. 
YÊU CẦU:
1. Đọc nội dung bài tập từ file.
2. Viết lại đề bài rõ ràng.
3. Cung cấp lời giải chi tiết, giải thích cặn kẽ từng bước để học sinh dễ hiểu.
4. Định dạng đầu ra thành 2 phần rõ rệt (dùng tiêu đề H2):
## Đề bài
[Nội dung đề]

## Lời giải chi tiết
[Các bước giải chi tiết]

5. ĐỐI VỚI CÁC MÔN KHOA HỌC (Toán, Lý, Hóa, Sinh, Tin học): BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng (chữ to, đứng riêng một dòng). KHÔNG sử dụng ký tự Unicode mô phỏng công thức.\`;

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

`;
    code = code.substring(0, insertPos) + endpointCode + code.substring(insertPos);
    fs.writeFileSync(filePath, code);
    console.log("Endpoint added to server.ts");
}
