import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export default async function handler(req, res) {
  // Tránh lỗi CORS và method
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chưa nhận biến GEMINI_API_KEY trên Vercel' });
  }

  try {
    const body = req.body || {};
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Dùng model 1.5 flash chuẩn, tuyệt đối không dùng 2.5
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = body.customPrompt || body.prompt || `Bạn là giáo viên. Hãy soạn giáo án bài: ${body.topic || 'Mệnh đề'}, môn Toán lớp ${body.grade || 10} theo CV 5512.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Trả về đầy đủ mọi định dạng tên biến mà Frontend có thể cần
    return res.status(200).json({
      success: true,
      text: text,
      result: text,
      plan: text,
      data: text,
      content: text
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
  }
}
