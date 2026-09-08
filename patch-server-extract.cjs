const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newApiEndpoint = `
  app.post("/api/extract-data", express.json({limit: '50mb'}), async (req, res) => {
    try {
      const { file, type } = req.body;
      let promptText = "";
      let responseSchema;
      
      if (type === "timetable") {
        promptText = \`Trích xuất Thời khóa biểu từ tài liệu. Hệ thống tiết học: Sáng (tiết 1, 2, 3, 4, 5), Chiều (tiết 6, 7, 8, 9, 10), Tối (tiết Tối).
Nếu trong tài liệu ghi buổi chiều tiết 1,2,3,4,5 thì tự động chuyển đổi thành tiết 6,7,8,9,10.
Trả về danh sách các tiết học/lịch công tác.\`;
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
        const cleanJson = response.text.replace(/\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '').trim();
        parsed = JSON.parse(cleanJson);
      }
      
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to extract data" });
    }
  });
`;

const startIdx = code.indexOf('app.post("/api/generate-exam"');
if (startIdx !== -1) {
  code = code.substring(0, startIdx) + newApiEndpoint.trim() + '\n\n  ' + code.substring(startIdx);
  fs.writeFileSync('server.ts', code);
  console.log('Server extract API patched');
}
