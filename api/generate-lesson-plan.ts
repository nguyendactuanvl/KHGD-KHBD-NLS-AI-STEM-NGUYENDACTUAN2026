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
    
    // Thu thập đầy đủ dữ liệu từ form giao diện gửi lên
    const topic = body.topic || body.lessonName || 'Mệnh đề';
    const grade = body.grade || 'Lớp 10';
    const periods = body.periods || body.numPeriods || 4;
    const requirements = body.requirements || body.objectives || body.details || '';
    const digitalCompetence = body.digitalCompetence || '1.1.NC1a: Kiểm tra tính logic của mệnh đề.';
    const aiCompetence = body.aiCompetence || '10.C2.3; 10.C3.2: Phân tích logic và kiểm tra mệnh đề qua ChatGPT/Gemini.';
    const stem = body.stem || 'Có';
    const textbook = body.textbook || 'Kết nối tri thức với cuộc sống';

    // Xây dựng System Prompt chi tiết theo đúng cấu trúc CV 5512 & GDPT 2018
    const promptText = body.customPrompt || `Bạn là chuyên gia sư phạm Toán học chương trình GDPT 2018. Hãy soạn một Kế hoạch bài dạy (Giáo án) chi tiết, chỉn chu, đúng chuẩn Công văn 5512/BGDĐT-GDTrH.
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "${textbook}".
Các thông tin cốt lõi của bài học:
- Tên bài: ${topic}
- Cấp học: ${grade}
- Thời lượng: ${periods} tiết
- Yêu cầu cần đạt: ${requirements}
- Năng lực số tích hợp: ${digitalCompetence}
- Năng lực AI tích hợp: ${aiCompetence}
- Tích hợp STEM/STEAM: ${stem}

BẮT BUỘC TRÌNH BÀY ĐẦY ĐỦ CÁC MỤC THEO KHUNG CV 5512:
I. MỤC TIÊU:
1. Về kiến thức
2. Về năng lực:
   - Năng lực chung (Tự chủ - tự học, Giao tiếp - hợp tác, Giải quyết vấn đề và sáng tạo).
   - Năng lực toán học (Tư duy và lập luận toán học, Mô hình hóa toán học, Giải quyết vấn đề toán học, Giao tiếp toán học, Sử dụng công cụ phương tiện học toán).
   - Năng lực số: Tích hợp cụ thể nội dung "${digitalCompetence}".
   - Năng lực AI: Tích hợp rõ hoạt động học sinh thực hành phân tích, kiểm chứng logic qua AI ("${aiCompetence}").
3. Về phẩm chất (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm).

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
1. Giáo viên (Giáo án, bài giảng điện tử, phiếu học tập, ứng dụng AI/phần mềm).
2. Học sinh (SGK, vở ghi, thiết bị kết nối mạng nếu có hoạt động AI/số).

III. TIẾN TRÌNH DẠY HỌC:
Trình bày chi tiết từng hoạt động (1. Khởi động, 2. Hình thành kiến thức mới, 3. Luyện tập, 4. Vận dụng - có lồng ghép STEM và ứng dụng AI).
Mỗi hoạt động phải gồm đủ 4 bước chuẩn CV 5512:
a) Mục tiêu
b) Nội dung
c) Sản phẩm
d) Tổ chức thực hiện:
   - Chuyển giao nhiệm vụ
   - Thực hiện nhiệm vụ
   - Báo cáo, thảo luận
   - Kết luận, nhận định

Định dạng văn bản rõ ràng, phân cấp khoa học bằng Markdown, công thức Toán học dùng ký hiệu chuẩn TeX.`;

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

    return res.status(200).json({
      success: true,
      result: outputText,
      text: outputText,
      plan: outputText,
      content: outputText
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
