const fs = require('fs');

const generateExamPath = 'api/generate-exam.ts';
let content = fs.readFileSync(generateExamPath, 'utf8');
content = `import { Type, GoogleGenAI } from "@google/genai";

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
  apiKey = apiKey.replace(/[^\\x20-\\x7E]/g, '').trim();
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
        console.log(\`Trying model \${model} (attempt \${attempt + 1})...\`);
        return await client.models.generateContent({ ...payloadOptions, model });
      } catch (error: any) {
        console.error(\`Model \${model} failed:\`, error?.message);
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
      console.warn(\`Attempt \${attempt + 1} failed with Quota/Overload. Retrying in \${3000 * (attempt + 1)}ms...\`);
      await delay(3000 * (attempt + 1) + Math.random() * 1000);
    }
  }
  throw primaryError;
}

export const maxDuration = 60;
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const body = req.body || {};
    const subject = body.subject || 'Toán';
    const grade = body.grade || '9';
    const duration = body.duration || '45';
    const matrix = body.matrix || body.rawMatrix || 'Chương trình chuẩn GDPT 2018';
    const customPrompt = body.customPrompt || '';
    
    // Parse counts
    const qCounts = body.qCounts || { mc: 20, tf: 0, sa: 0, essay: 0 };
    const mc = qCounts.mc || 0;
    const tf = qCounts.tf || 0;
    const sa = qCounts.sa || 0;
    const essay = qCounts.essay || 0;
    
    let mathPrompt = \`Cấu trúc đề yêu cầu:
- Trắc nghiệm nhiều lựa chọn (mc): \${mc} câu.
- Trắc nghiệm Đúng/Sai (tf): \${tf} câu.
- Trắc nghiệm trả lời ngắn (sa): \${sa} câu.
- Tự luận (essay): \${essay} câu.\`;

    const promptText = \`Bạn là chuyên gia ra đề thi môn \${subject} Lớp \${grade}.
Thời gian làm bài: \${duration} phút.
Ma trận / Nội dung: \${matrix}.
\${customPrompt ? "Yêu cầu thêm: " + customPrompt : ""}
\${mathPrompt}

BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON VỚI CẤU TRÚC:
{
  "title": "ĐỀ KIỂM TRA MÔN \${subject.toUpperCase()} LỚP \${grade}",
  "duration": "\${duration}",
  "questions": [
    {
      "id": 1,
      "number": 1,
      "type": "mc", // "mc" (nhiều lựa chọn), "tf" (đúng sai), "sa" (trả lời ngắn), "essay" (tự luận)
      "content": "Nội dung câu hỏi...",
      "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"], // CHỈ DÙNG CHO type="mc"
      "correct": "A", // Đáp án đúng cho "mc" (A/B/C/D)
      "correctAnswer": "Lời giải/Đáp án chi tiết hoặc đáp án đúng cho các loại câu khác", // Dùng cho tf, sa, essay
      "explanation": "Lời giải chi tiết..."
    }
  ]
}\`;

    const response = await generateWithFallback(req, {
      contents: promptText,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const rawOutput = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawOutput);
    } catch {
      parsedData = { questions: [] };
    }
    
    const rawQuestions = Array.isArray(parsedData.questions) ? parsedData.questions : (Array.isArray(parsedData) ? parsedData : []);
    const formattedQuestions = rawQuestions.map((q: any, idx: number) => {
      const questionText = q.content || q.question || q.text || q.title || \`Câu hỏi số \${idx + 1}\`;
      const choices = q.options || q.choices || q.answers || [];
      const rightAns = q.correct || q.answer || '';
      const correctAnsStr = q.correctAnswer || q.correct || q.answer || q.explanation || '';
      const explain = q.explanation || q.explain || q.solution || '';
      
      const type = q.type || (choices.length > 0 ? 'mc' : 'essay');
      
      let correctOptionIndex = 0;
      if (type === 'mc') {
         if (rightAns === 'A' || rightAns.includes('A.')) correctOptionIndex = 0;
         else if (rightAns === 'B' || rightAns.includes('B.')) correctOptionIndex = 1;
         else if (rightAns === 'C' || rightAns.includes('C.')) correctOptionIndex = 2;
         else if (rightAns === 'D' || rightAns.includes('D.')) correctOptionIndex = 3;
      }
      return {
        id: q.id || idx + 1,
        number: idx + 1,
        type: type,
        content: questionText,
        options: choices,
        correct: rightAns,
        correctAnswer: correctAnsStr,
        correctOptionIndex: correctOptionIndex,
        explanation: explain,
        level: q.level || 'Nhận biết',
        topic: q.topic || 'Chung',
        subtopic: q.subtopic || 'Chung'
      };
    });
    
    return res.status(200).json({
      success: true,
      data: { ...parsedData, questions: formattedQuestions },
      questions: formattedQuestions,
      examName: parsedData.title || \`Đề kiểm tra \${subject}\`,
      exam: { ...parsedData, questions: formattedQuestions },
      result: { ...parsedData, questions: formattedQuestions }
    });
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("quota")) {
      return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
    }
    return res.status(500).json({ error: errorMsg || "Failed to generate exam" });
  }
}
`;
fs.writeFileSync(generateExamPath, content);
console.log('Patched generate-exam.ts');

