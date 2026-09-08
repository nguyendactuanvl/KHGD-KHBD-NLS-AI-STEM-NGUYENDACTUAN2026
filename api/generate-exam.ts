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
    
    // Thu thập các thông số từ giao diện Tạo đề
    const subject = body.subject || 'Toán';
    const grade = body.grade || 'Lớp 9';
    const duration = body.duration || '45';
    const examType = body.examType || '15 phút';
    const multipleChoiceCount = body.multipleChoiceCount ?? body.mcq ?? 20;
    const trueFalseCount = body.trueFalseCount ?? body.tf ?? 0;
    const shortAnswerCount = body.shortAnswerCount ?? body.short ?? 0;
    const essayCount = body.essayCount ?? body.essay ?? 0;
    const matrix = body.matrix || body.rawMatrix || 'Theo chương trình chuẩn GDPT 2018';
    const extraRequirements = body.extraRequirements || body.requirements || '';

    // Xây dựng System Prompt chi tiết chuẩn GDPT 2018
    const promptText = body.customPrompt || `Bạn là chuyên gia khảo thí và xây dựng đề kiểm tra môn ${subject} cấp THCS/THPT.
Hãy tạo một Đề kiểm tra gốc kèm Bảng đáp án và Hướng dẫn chấm chi tiết với các yêu cầu sau:
- Môn: ${subject} - ${grade}
- Thời gian làm bài: ${duration} phút (Hình thức: ${examType})
- Cấu trúc số lượng câu hỏi:
  + Trắc nghiệm nhiều lựa chọn (4 phương án A, B, C, D): ${multipleChoiceCount} câu
  + Trắc nghiệm Đúng/Sai: ${trueFalseCount} câu
  + Trắc nghiệm trả lời ngắn: ${shortAnswerCount} câu
  + Tự luận: ${essayCount} câu
- Khung Ma trận / Nội dung kiến thức: ${matrix}
- Yêu cầu bổ sung: ${extraRequirements}

YÊU CẦU ĐỊNH DẠNG ĐỀ THI:
1. TIÊU ĐỀ: Ghi rõ Tên trường/kỳ thi, Môn, Lớp, Thời gian làm bài.
2. PHẦN I: CÂU HỎI TRẮC NGHIỆM (nếu có, ghi rõ từng câu: Câu 1, Câu 2... với 4 đáp án A. B. C. D. xuống dòng rõ ràng).
3. PHẦN II: CÂU HỎI ĐÚNG/SAI (nếu có, mỗi câu gồm 4 ý a, b, c, d).
4. PHẦN III: CÂU HỎI TRẢ LỜI NGẮN (nếu có).
5. PHẦN IV: TỰ LUẬN (nếu có).
6. BẢNG ĐÁP ÁN VÀ LỜI GIẢI CHI TIẾT: Trình bày bảng đáp án nhanh và hướng dẫn giải từng câu.

Toàn bộ công thức Toán phải dùng định dạng LaTeX chuẩn ($...$ hoặc $$...$$).`;

    // Gọi trực tiếp model gemini-3.6-flash chuẩn mới
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Lỗi từ Google API' });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Trả về đầy đủ mọi thuộc tính dữ liệu mà Frontend có thể cần
    return res.status(200).json({
      success: true,
      result: outputText,
      exam: outputText,
      data: outputText,
      text: outputText,
      content: outputText
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
