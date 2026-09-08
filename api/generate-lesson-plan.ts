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
    const promptText = body.customPrompt || body.prompt || `Hãy soạn Kế hoạch bài dạy môn Toán lớp ${body.grade || 10}, bài ${body.topic || 'Mệnh đề'} chuẩn Công văn 5512.`;

    // Gọi trực tiếp model gemini-3.6-flash theo yêu cầu mới nhất từ Google API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lỗi từ Google API:', JSON.stringify(data));
      return res.status(500).json({ error: data.error?.message || 'Lỗi từ Google API' });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      result: outputText,
      text: outputText,
      plan: outputText,
      content: outputText
    });
  } catch (err) {
    console.error('Lỗi server:', err);
    return res.status(500).json({ error: err.message });
  }
}
