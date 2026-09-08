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
    const matrix = body.matrix || body.rawMatrix || 'Chương trình chuẩn GDPT 2018';

    const promptText = `Bạn là chuyên gia ra đề thi môn ${subject} Lớp ${grade}.
Hãy tạo đề trắc nghiệm gồm ${mcqCount} câu hỏi chuẩn 4 lựa chọn A, B, C, D theo ma trận: ${matrix}.

BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON VỚI CẤU TRÚC:
{
  "title": "ĐỀ KIỂM TRA MÔN ${subject.toUpperCase()} LỚP ${grade}",
  "duration": "${duration}",
  "questions": [
    {
      "id": 1,
      "number": 1,
      "content": "Nội dung câu hỏi 1 ở đây?",
      "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
      "correct": "A",
      "answer": "A",
      "explanation": "Lời giải chi tiết câu 1..."
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
      return res.status(500).json({ error: data.error?.message || 'Lỗi Google API' });
    }

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(rawOutput);
    } catch {
      parsedData = { questions: [] };
    }

    const rawQuestions = Array.isArray(parsedData.questions) ? parsedData.questions : (Array.isArray(parsedData) ? parsedData : []);

    // Ánh xạ đồng bộ TẤT CẢ các biến để dù Frontend gọi tên nào cũng có dữ liệu
    const formattedQuestions = rawQuestions.map((q, idx) => {
      const questionText = q.content || q.question || q.text || q.title || `Câu hỏi số ${idx + 1}`;
      const choices = q.options || q.choices || q.answers || [];
      const rightAns = q.correct || q.answer || q.correctAnswer || 'A';
      const explain = q.explanation || q.explain || q.solution || '';

      return {
        id: q.id || idx + 1,
        number: idx + 1,
        // Các biến chứa đề bài:
        content: questionText,
        question: questionText,
        text: questionText,
        title: questionText,
        // Các biến chứa đáp án trắc nghiệm:
        options: choices,
        choices: choices,
        answers: choices,
        // Các biến chứa đáp án đúng:
        correct: rightAns,
        answer: rightAns,
        correctAnswer: rightAns,
        // Lời giải:
        explanation: explain,
        explain: explain
      };
    });

    return res.status(200).json({
      success: true,
      data: { ...parsedData, questions: formattedQuestions },
      questions: formattedQuestions,
      exam: { ...parsedData, questions: formattedQuestions },
      result: { ...parsedData, questions: formattedQuestions }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
