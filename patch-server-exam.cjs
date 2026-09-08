const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('sharedExamsStore')) {
  // Inject store
  code = code.replace('async function startServer() {', 'const sharedExamsStore = new Map();\n\nasync function startServer() {');
  
  const endpoints = `
  app.post("/api/generate-exam", async (req, res) => {
    try {
      const { subject, grade, totalQuestions, matrix, customPrompt } = req.body;
      
      const prompt = \`Hãy tạo một đề kiểm tra trắc nghiệm môn \${subject} lớp \${grade}.
Tổng số câu: \${totalQuestions}.
Yêu cầu ma trận: \${matrix}
\${customPrompt ? "Yêu cầu thêm: " + customPrompt : ""}

Hãy trả về định dạng JSON nghiêm ngặt với cấu trúc như sau:
{
  "examName": "Tên đề kiểm tra",
  "questions": [
    {
      "id": 1,
      "content": "Nội dung câu hỏi",
      "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
      "correctOptionIndex": 0,
      "level": "Nhận biết"
    }
  ]
}
Chú ý: correctOptionIndex là vị trí của đáp án đúng trong mảng options (0, 1, 2, hoặc 3). Nội dung câu hỏi và các lựa chọn KHÔNG BAO GỒM các tiền tố như "Câu 1:" hay "A.".
\`;
      
      const payloadOptions = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
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
                    content: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.NUMBER },
                    level: { type: Type.STRING }
                  },
                  required: ["id", "content", "options", "correctOptionIndex", "level"]
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
        const cleanJson = response.text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
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

  if (process.env.NODE_ENV !== "production") {`;
  
  code = code.replace('  if (process.env.NODE_ENV !== "production") {', endpoints);
  fs.writeFileSync('server.ts', code);
  console.log("server.ts patched");
} else {
  console.log("Already patched");
}
