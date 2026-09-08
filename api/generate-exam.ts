export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Thiếu biến GEMINI_API_KEY trên Vercel' });
  }

  try {
    const body = req.body || {};
    const subject = body.subject || 'Toán';
    const grade = body.grade || '9';
    const duration = body.duration || '45';
    const mcqCount = Number(body.multipleChoiceCount ?? body.mcq ?? 20);
    const tfCount = Number(body.trueFalseCount ?? body.tf ?? 0);
    const shortCount = Number(body.shortAnswerCount ?? body.short ?? 0);
    const essayCount = Number(body.essayCount ?? body.essay ?? 0);
    const matrix = body.matrix || body.rawMatrix || 'Chương trình môn Toán THCS/THPT hiện hành';

    const promptText = `Bạn là chuyên gia ra đề thi chuẩn GDPT 2018 môn ${subject} Lớp ${grade}.
Hãy tạo đề kiểm tra thời gian ${duration} phút theo cấu trúc:
- Trắc nghiệm 4 lựa chọn: ${mcqCount} câu
- Trắc nghiệm Đúng/Sai: ${tfCount} câu
- Trả lời ngắn: ${shortCount} câu
- Tự luận: ${essayCount} câu
Khung ma trận: ${matrix}

BẮT BUỘC TRẢ VỀ DỮ LIỆU ĐÚNG ĐỊNH DẠNG JSON DUY NHẤT (không dùng markdown \`\`\`json bọc bên ngoài), cấu trúc như sau:
{
  "title": "ĐỀ KIỂM TRA MÔN ${subject.toUpperCase()} LỚP ${grade}",
  "duration": "${duration} phút",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Nội dung câu hỏi...",
      "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
      "answer": "A",
      "explanation": "Lời giải chi tiết..."
    }
  ],
  "rawText": "Toàn văn đề thi và đáp án để in ấn"
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
      return res.status(500).json({ error: data.error?.message || 'Lỗi Google API' });
    }

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawOutput);
    } catch {
      parsedData = { questions: [], rawText: rawOutput };
    }

    const questionsList = parsedData.questions || [];
    const fullText = parsedData.rawText || rawOutput;

    // Trả về cả mảng questions và text để mọi hàm ở frontend đều nhận được
    return res.status(200).json({
      success: true,
      data: parsedData,
      questions: questionsList,
      exam: parsedData,
      result: parsedData,
      text: fullText,
      rawText: fullText
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
