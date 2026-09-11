export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let customKey = req.headers['x-gemini-api-key'];
  if (customKey) {
    try { customKey = decodeURIComponent(customKey); } catch (e) {}
  }
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Thiếu biến GEMINI_API_KEY trên Vercel' });
  }

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

    let mathPrompt = `Cấu trúc đề yêu cầu:
- Trắc nghiệm nhiều lựa chọn (mc): ${mc} câu.
- Trắc nghiệm Đúng/Sai (tf): ${tf} câu.
- Trắc nghiệm trả lời ngắn (sa): ${sa} câu.
- Tự luận (essay): ${essay} câu.
`;

    const promptText = `Bạn là chuyên gia ra đề thi môn ${subject} Lớp ${grade}.
Thời gian làm bài: ${duration} phút.
Ma trận / Nội dung: ${matrix}.
${customPrompt ? "Yêu cầu thêm: " + customPrompt : ""}

${mathPrompt}

BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON VỚI CẤU TRÚC:
{
  "title": "ĐỀ KIỂM TRA MÔN ${subject.toUpperCase()} LỚP ${grade}",
  "duration": "${duration}",
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
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = typeof data.error?.message === 'string' ? data.error.message : JSON.stringify(data.error || 'Lỗi từ Google API');
      const isAuthError = errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("deleted") || errorMsg.includes("disabled") || errorMsg.includes("ACCOUNT_STATE_INVALID");
      const isOverload = errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || response.status === 429 || errorMsg.includes("503") || response.status === 503 || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("high demand") || errorMsg.includes("High demand");
      
      if (isAuthError) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản API Key của bạn không hợp lệ hoặc đã bị khóa." });
      }
      if (isOverload) {
        return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao. Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
      }
      return res.status(500).json({ error: errorMsg });
    }

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawOutput);
    } catch {
      parsedData = { questions: [] };
    }

    const rawQuestions = Array.isArray(parsedData.questions) ? parsedData.questions : (Array.isArray(parsedData) ? parsedData : []);

    const formattedQuestions = rawQuestions.map((q, idx) => {
      const questionText = q.content || q.question || q.text || q.title || `Câu hỏi số ${idx + 1}`;
      const choices = q.options || q.choices || q.answers || [];
      const rightAns = q.correct || q.answer || '';
      const correctAnsStr = q.correctAnswer || q.correct || q.answer || q.explanation || '';
      const explain = q.explanation || q.explain || q.solution || '';
      
      const type = q.type || (choices.length > 0 ? 'mc' : 'essay');
      
      // Determine index of correct option if it's multiple choice
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
      examName: parsedData.title || `Đề kiểm tra \${subject}`,
      exam: { ...parsedData, questions: formattedQuestions },
      result: { ...parsedData, questions: formattedQuestions }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
