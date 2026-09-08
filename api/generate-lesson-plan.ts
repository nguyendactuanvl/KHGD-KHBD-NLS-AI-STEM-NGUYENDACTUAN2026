import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên hệ thống' });
  }

  try {
    const { topic, grade, details, customPrompt } = req.body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = customPrompt || `Bạn là chuyên gia sư phạm. Hãy soạn Kế hoạch bài dạy (giáo án) chuẩn Công văn 5512 cho:
- Môn học: Toán
- Lớp: ${grade || 10}
- Bài học: ${topic || 'Bài học'}
- Thông tin chi tiết / Yêu cầu cần đạt: ${JSON.stringify(details || '')}
Nội dung phải đầy đủ các bước: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng theo CV 5512.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    return res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
  }
}
