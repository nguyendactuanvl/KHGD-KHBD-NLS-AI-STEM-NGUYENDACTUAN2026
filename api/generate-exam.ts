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
  const models = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
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
      
      const parts: any[] = [{ text: promptText }];
      
      if (matrixFile) {
        // matrixFile is data URI: data:image/png;base64,....
        const matches = matrixFile.match(/^data:([a-zA-Z0-9\/\+\-\.]+);base64,(.+)$/);
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
        config: {
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
}
