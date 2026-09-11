
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(express.json({ limit: '50mb' }));

const sharedExamsStore = new Map();

function getAiClient(req: any) {
  let customKey = req.headers['x-gemini-api-key'] as string;
  if (customKey) {
    try { customKey = decodeURIComponent(customKey); } catch (e) {}
  }
  let apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");
  return new GoogleGenAI({ apiKey: apiKey.replace(/[^\x20-\x7E]/g, '').trim() });
}

function handleAiError(error: any, req: any, res: any) {
  const errorMsg = error?.message || "";
  const isCustomKey = !!req.headers['x-gemini-api-key'];

  if (errorMsg.includes("UNAUTHENTICATED") || errorMsg.includes("service account is deleted") || error?.status === 401 || errorMsg.includes("ACCOUNT_STATE_INVALID")) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản dịch vụ liên kết với API Key cá nhân của bạn đã bị vô hiệu hóa hoặc không hợp lệ." });
  }

  if (errorMsg.includes("suspended") || errorMsg.includes("PERMISSION_DENIED") || error?.status === 403) {
    if (!isCustomKey) {
        return res.status(401).json({ error: "UNAUTHENTICATED: Hệ thống AI hiện đang bảo trì hoặc hết hạn ngạch." });
    }
    return res.status(401).json({ error: "UNAUTHENTICATED: Tài khoản API Key cá nhân của bạn đã bị từ chối quyền truy cập." });
  }

  if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("503") || error?.status === 503 || errorMsg.includes("UNAVAILABLE")) {
    return res.status(429).json({ error: "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (503). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });
  }

  console.error("Unhandled AI Error:", error);
  res.status(500).json({ error: errorMsg || "Đã xảy ra lỗi không xác định từ máy chủ AI. Vui lòng thử lại sau." });
}

async function generateWithFallback(req: any, payloadOptions: any) {
  const client = getAiClient(req);
  for (const model of ["gemini-3.6-flash", "gemini-3.1-pro-preview"]) {
    try {
      return await client.models.generateContent({ ...payloadOptions, model });
    } catch (e: any) {
      if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.status === 429 || e?.message?.includes("503") || e?.status === 503 || e?.message?.includes("UNAVAILABLE")) continue;
      throw e;
    }
  }
  throw new Error("429 RESOURCE_EXHAUSTED All models failed");
}

app.all("/api/circulars", async (req, res) => {

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    res.json([
      { id: "5512/BGDĐT-GDTrH", date: "18/12/2020", title: "Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường" },
      { id: "3456/BGDĐT-GDPT", date: "27/6/2025", title: "Hướng dẫn triển khai thực hiện khung năng lực số cho học sinh phổ thông" },
      { id: "2422/QĐ-BGDĐT", date: "18/8/2026", title: "Ban hành Khung nội dung giáo dục trí tuệ nhân tạo cho học sinh phổ thông" }
    ]);

});

app.all("/api/extract-data", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { file, type } = req.body;
      let promptText = "";
      let responseSchema;
      
      if (type === "timetable") {
        promptText = `Trích xuất Thời khóa biểu từ tài liệu. Hệ thống tiết học: Sáng (tiết 1, 2, 3, 4, 5), Chiều (tiết 6, 7, 8, 9, 10), Tối (tiết Tối).
Nếu trong tài liệu ghi buổi chiều tiết 1,2,3,4,5 thì tự động chuyển đổi thành tiết 6,7,8,9,10.
Trả về danh sách các tiết học/lịch công tác.`;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            entries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "Ví dụ: Thứ 2, Thứ 3..." },
                  period: { type: Type.STRING, description: "Từ 1 đến 10, hoặc 'Tối'" },
                  content: { type: Type.STRING }
                },
                required: ["day", "period", "content"]
              }
            }
          },
          required: ["entries"]
        };
      } else if (type === "student_profiles") {
        promptText = "Trích xuất danh sách học sinh kèm thông tin liên lạc từ tài liệu đính kèm. Bỏ qua tiêu đề. Lấy họ tên, ngày sinh, số điện thoại học sinh, họ tên phụ huynh, số điện thoại phụ huynh, địa chỉ, ghi chú (nếu có).";
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            students: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dob: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  parentName: { type: Type.STRING },
                  parentPhone: { type: Type.STRING },
                  address: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name"]
              }
            }
          },
          required: ["students"]
        };
      } else if (type === "students") {
        promptText = "Trích xuất danh sách họ và tên học sinh từ tài liệu đính kèm. Bỏ qua các tiêu đề, STT, cột điểm, chỉ lấy họ và tên.";
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            students: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["students"]
        };
      } else {
        throw new Error("Invalid extract type");
      }
      
      const matches = file.match(/^data:([a-zA-Z0-9\/\+\-\.]+);base64,(.+)$/);
      if (!matches) throw new Error("Invalid file format");
      
      const parts = [
        { text: promptText },
        {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        }
      ];
      
      const payloadOptions = {
        contents: [{ role: "user", parts }],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema
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
    } catch (error: any) {
    return handleAiError(error, req, res);
  }
});

app.all("/api/generate-exam", async (req, res) => {

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

    
    const response = await generateWithFallback(req, {
      contents: [{ parts: [{ text: promptText }] }]
      , config: {
          responseMimeType: "application/json"
        }
    });
    const rawOutput = response.text || '';
  
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
  } catch (err: any) {
    return handleAiError(err, req, res);
  }
});

app.all("/api/generate-lesson-plan-file", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { lesson, subject, files, textbook } = req.body;
      const textbookName = textbook || "Kết nối tri thức với cuộc sống";
      
      const prompt = `Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Tôi đã tải lên một tài liệu Kế hoạch giáo dục (KHGD).
Dựa vào các tài liệu được cung cấp (Sách, Văn bản, KHDH...), hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn ${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}".
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "${textbookName}".
Trích xuất các thông tin về:
- Số tiết (phân bổ thời gian cho bài học này)
- Yêu cầu cần đạt
- Năng lực số
- Năng lực AI
- Tích hợp STEM/STEAM
của chính bài học đó. Sau đó, sử dụng các thông tin này để soạn chi tiết một Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học đó.

Yêu cầu định dạng và nội dung (dùng cú pháp Markdown):
1. **Phân chia tiết học**: BẮT BUỘC dựa vào số tiết trích xuất được để phân bổ rõ ràng tiến trình dạy học. Ví dụ bài có 2 tiết thì phải ghi rõ "Tiết 1: ... (45 phút)", "Tiết 2: ... (45 phút)". Mỗi tiết đảm bảo thời lượng đúng 45 phút.
2. **Tuyệt đối KHÔNG sử dụng thẻ HTML \`<br>\` hoặc \`<br/>\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
3. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\` để tô màu xanh nổi bật.
4. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Sử dụng duy nhất dấu $ cho công thức trong dòng (ví dụ: $a+b=c$) và $$ cho công thức riêng (ví dụ: $x^2$). Không dùng các ký tự Unicode mô phỏng công thức.
5. **Bảng biểu**: Sử dụng chuẩn bảng Markdown đẹp mắt (Markdown tables) để phân chia rõ ràng Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện.
6. **I. MỤC TIÊU**: Trình bày rõ ràng Kiến thức, Năng lực số, Năng lực AI, và Yêu cầu STEM. Các mã chỉ báo (như [3.1.NC1a]) phải được giữ nguyên và giải thích ngắn gọn cách đạt được trong bài.
7. **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**: Ghi rõ các thiết bị số, phần mềm, công cụ AI cần thiết.
8. **III. TIẾN TRÌNH DẠY HỌC**:
   Trình bày tiến trình giảng dạy rõ ràng theo từng tiết (Tiết 1, Tiết 2...). Phải thiết kế theo 4 hoạt động chuẩn: 
   - Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập.
   - Hoạt động 2: Hình thành kiến thức mới.
   - Hoạt động 3: Luyện tập.
   - Hoạt động 4: Vận dụng.
   Mỗi hoạt động phải trình bày rõ ràng bằng BẢNG (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện). Đặc biệt, lồng ghép khéo léo việc sử dụng phần mềm, kỹ năng số, hoặc ứng dụng AI vào phần "Tổ chức thực hiện".
   
Văn phong cần chuyên nghiệp, sư phạm, thực tế. Nếu không tìm thấy bài học trong tài liệu, hãy thông báo lỗi nhẹ nhàng và soạn một giáo án dự kiến.`;;

      const response = await generateWithFallback(req, {
        contents: [
          {
            role: "user",
            parts: [
              ...(files || []).map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          temperature: 0.7,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI File Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("Unsupported MIME type")) {
        return res.status(400).json({ error: "Định dạng file không được AI hỗ trợ. Vui lòng chuyển file sang định dạng PDF và thử lại." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate lesson plan from file" });
    }

});

app.all("/api/generate-lesson-plan", async (req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  

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

    
    const response = await generateWithFallback(req, {
      contents: [{ parts: [{ text: promptText }] }]
      
    });
    const outputText = response.text || '';
    

    return res.status(200).json({
      success: true,
      result: outputText,
      text: outputText,
      plan: outputText,
      content: outputText
    });
  } catch (err: any) {
    return handleAiError(err, req, res);
  }
});

app.all("/api/generate-plan", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { subject, grade, topic, files } = req.body;
      
      const prompt = `Bạn là một Tổ trưởng chuyên môn và chuyên gia giáo dục. Hãy tạo/bổ sung một mẫu Kế hoạch giáo dục (KHGD) cho môn ${subject}, lớp ${grade}, chủ đề "${topic}".
      Giữ nguyên cấu trúc KHGD gốc (của công văn 5512/BGDĐT-GDTrH) và chỉ bổ sung các cột còn thiếu theo yêu cầu chuẩn của các công văn mới nhất về Năng lực số (NLS) (CV 3456) và Năng lực AI (QĐ 2422).
      
      YÊU CẦU BẮT BUỘC ĐỐI VỚI NỘI DUNG:
      - Cột "Năng lực số": BẮT BUỘC phải bắt đầu bằng mã chỉ báo cụ thể trong dấu ngoặc vuông (ví dụ: [1.1.NC1a], [3.1.NC1a], [5.3.NC1b]...). Theo sau là nội dung ứng dụng. Ví dụ: "[3.1.NC1a] Sử dụng công cụ vẽ số hóa biểu đồ".
      - Cột "Năng lực AI": BẮT BUỘC phải bắt đầu bằng mã chỉ báo cụ thể trong dấu ngoặc vuông theo QĐ 2422 (ví dụ: [10.A1.1], [10.C2.1], [12.D2.1]...). Theo sau là yêu cầu cần đạt về AI tương ứng.
      - Cột "Giáo dục STEM/STEAM": Đề xuất hợp lý nhất các bài có thể tích hợp Stem/Steam phù hợp với năng lực và điều kiện thực tế.
      - Giữ nguyên các cột gốc: Bài học, Số tiết/bài, Yêu cầu cần đạt.
      
      Trả về kết quả dưới dạng danh sách JSON array với các thuộc tính: lesson, periods, requirement, digitalComp, aiComp, stem, note.`;

      let contents: any = prompt;
      if (files && files.length > 0) {
        contents = [
          {
            role: "user",
            parts: [
              ...files.map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ];
      }
      const response = await generateWithFallback(req, {
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lesson: { type: Type.STRING },
                periods: { type: Type.NUMBER },
                requirement: { type: Type.STRING },
                digitalComp: { type: Type.STRING },
                aiComp: { type: Type.STRING },
                stem: { type: Type.STRING },
                note: { type: Type.STRING }
              },
              required: ["lesson", "periods", "requirement", "digitalComp", "aiComp", "stem", "note"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      res.json(data);
    } catch (error: any) {
      console.error("AI Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate plan" });
    }

});

app.all("/api/generate-similar", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = `Bạn là một chuyên gia giáo dục. Dưới đây là bài tập, đề thi hoặc tài liệu mà giáo viên cung cấp.
YÊU CẦU:
1. Đọc và phân tích cấu trúc, độ khó, dạng bài, và kiến thức trọng tâm của tài liệu gốc.
2. TẠO RA MỘT ĐỀ BÀI HOẶC BỘ BÀI TẬP TƯƠNG TỰ (cùng cấu trúc, độ khó, và dạng bài nhưng thay đổi số liệu, ngữ cảnh hoặc cách hỏi).
3. CUNG CẤP LỜI GIẢI CHI TIẾT cho ĐỀ TƯƠNG TỰ vừa tạo.

Định dạng đầu ra rõ ràng:
## Đề bài tương tự
[Nội dung đề vừa tạo]

## Lời giải chi tiết
[Các bước giải chi tiết cho đề tương tự]

LƯU Ý ĐỐI VỚI CÔNG THỨC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học, lý, hóa. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng. KHÔNG sử dụng ký tự Unicode mô phỏng công thức.`;

      const response = await generateWithFallback(req, {
        contents: [
          {
            role: "user",
            parts: [
              ...(files || []).map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          temperature: 0.7,
        }
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
    return handleAiError(error, req, res);
  }
});

app.all("/api/generate-worksheet", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { lesson, subject, grade, type } = req.body;
      
      const prompt = `Bạn là một giáo viên xuất sắc môn ${subject || "chung"}. Hãy tạo một Phiếu học tập (Worksheet) thật chuyên nghiệp, trực quan cho học sinh lớp ${grade}, bài học/chủ đề: "${lesson}".
      
      YÊU CẦU:
      1. Phần đầu: Tiêu đề phiếu học tập, Họ và tên học sinh, Lớp, Ngày.
      2. Tóm tắt kiến thức trọng tâm (ngắn gọn, dễ hiểu, dùng bảng biểu nếu cần).
      3. Hệ thống bài tập:
         - Hình thức: ${type || "Kết hợp trắc nghiệm và tự luận"}.
         - Phân hóa từ cơ bản đến vận dụng.
      4. Trình bày rõ ràng, để lại khoảng trống hợp lý giả định học sinh sẽ làm trực tiếp vào phiếu.
      5. ĐỐI VỚI CÁC MÔN KHOA HỌC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức. TẤT CẢ các biến số (như $x, V$), giá trị (như $500\text{ cm}^3$) ĐỀU PHẢI bọc trong dấu $. Sử dụng duy nhất dấu $ cho công thức trong dòng và $ cho công thức riêng.
      6. ĐÁP ÁN: Ở cuối tài liệu, hãy cung cấp phần Hướng dẫn giải/Đáp án, phân cách bằng một tiêu đề thật rõ ràng (ví dụ: "--- HƯỚNG DẪN CHẤM / ĐÁP ÁN ---") để giáo viên có thể cắt/xóa trước khi in cho học sinh.`;

      const response = await generateWithFallback(req, {
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Generation error:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid")) {
        return res.status(400).json({ error: "API Key không hợp lệ. Vui lòng kiểm tra lại Cài đặt hệ thống và đảm bảo API Key chính xác." });
      }
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
        return res.status(429).json({ error: "API Key của bạn đã vượt quá giới hạn lượt dùng miễn phí (Quota exceeded). Vui lòng đợi khoảng 1 phút rồi thử lại, hoặc nâng cấp tài khoản." });
      }
      if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("overloaded") || error?.status === 503) {
        return res.status(503).json({ error: "Hệ thống AI của Google hiện đang quá tải (Server Overloaded). Vui lòng đợi 5-10 giây rồi bấm thử lại." });
      }
      res.status(500).json({ error: "Failed to generate worksheet" });
    }

});

app.all("/api/pdf-to-word", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = `Bạn là một chuyên gia số hóa tài liệu. Nhiệm vụ của bạn là chuyển đổi TOÀN BỘ nội dung trong tài liệu (ảnh/PDF) được cung cấp sang định dạng văn bản (Markdown).

YÊU CẦU NGHIÊM NGẶT:
1. TUYỆT ĐỐI GIỮ NGUYÊN cấu trúc, số thứ tự câu, các mục lục, phân chương phân bài. Không được tự ý tóm tắt hay lược bỏ bất kỳ từ nào.
2. CHUYỂN TOÀN BỘ CÔNG THỨC, KÝ HIỆU Toán học, Vật lý, Hóa học sang định dạng chuẩn LaTeX:
   - TẤT CẢ các biến số (VD: $x, y, V, S$), các giá trị đại lượng (VD: $500\text{ cm}^3, 50\text{ kg}$), biểu thức, phương trình ĐỀU PHẢI được bọc trong dấu $.
   - Sử dụng một dấu $ (VD: $x^2 + 1 = 0$) cho công thức/ký hiệu nằm trong dòng chữ.
   - Sử dụng hai dấu $ (VD: $\int_0^1 x dx$) cho công thức đứng riêng một dòng.
   - KHÔNG dùng ký tự Unicode mô phỏng công thức (như x² hay ½).
3. HÌNH ẢNH / HÌNH VẼ: Do hạn chế kỹ thuật số hóa, nếu gặp biểu đồ, hình vẽ, đồ thị, hãy thêm một chú thích rõ ràng bằng chữ ở vị trí đó (Ví dụ: [Hình vẽ đồ thị hàm số...] hoặc [Hình ảnh mô tả...]) để giáo viên biết vị trí cần chèn lại ảnh gốc.
4. GIỮ NGUYÊN BẢNG BIỂU: Dùng cú pháp Markdown table để tạo lại chính xác các bảng biểu trong tài liệu.
5. Nếu trong tài liệu gốc có các thẻ HTML (như <img>) được truyền vào, TUYỆT ĐỐI GIỮ NGUYÊN Y HỆT các thẻ đó ở đúng vị trí.

Đầu ra của bạn phải hoàn toàn là nội dung tài liệu đã được số hóa, không thêm các câu chào hỏi thừa.`;

      const response = await generateWithFallback(req, {
        contents: [
          {
            role: "user",
            parts: [
              ...(files || []).map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          temperature: 0.1,
        }
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
    return handleAiError(error, req, res);
  }
});

app.all("/api/solve-exercise", async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
    try {
      const { files } = req.body;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const prompt = `Bạn là một giáo viên xuất sắc. Dưới đây là bài tập hoặc tài liệu học sinh đưa ra. 
YÊU CẦU:
1. Đọc nội dung bài tập từ file.
2. Viết lại đề bài rõ ràng.
3. Cung cấp lời giải chi tiết, giải thích cặn kẽ từng bước để học sinh dễ hiểu.
4. Định dạng đầu ra thành 2 phần rõ rệt (dùng tiêu đề H2):
## Đề bài
[Nội dung đề]

## Lời giải chi tiết
[Các bước giải chi tiết]

5. ĐỐI VỚI CÁC MÔN KHOA HỌC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức. TẤT CẢ các biến số (như $x, V$), giá trị (như $500\text{ cm}^3$) ĐỀU PHẢI bọc trong dấu $. Sử dụng duy nhất dấu $ cho công thức trong dòng và $ cho công thức riêng.`;

      const response = await generateWithFallback(req, {
        contents: [
          {
            role: "user",
            parts: [
              ...(files || []).map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          temperature: 0.2,
        }
      });
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Solve Exercise error:", error);
      res.status(500).json({ error: "Lỗi trong quá trình giải bài tập: " + (error?.message || "Lỗi không xác định") });
    }

});

app.get("/api/exams/:id", (req, res) => {
  const data = sharedExamsStore.get(req.params.id);
  if (data) res.json(data);
  else res.status(404).json({ error: "Exam not found" });
});

// Adding back chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    let fullPrompt = prompt;
    if (context) {
      fullPrompt = `Ngữ cảnh: ${JSON.stringify(context)}\n\nCâu hỏi: ${prompt}`;
    }
    const response = await generateWithFallback(req, {
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    });
    res.json({ text: response.text });
  } catch (error: any) {
    return handleAiError(error, req, res);
  }
});

if (!process.env.VERCEL) {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    import("vite").then(async ({ createServer }) => {
      const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
  }
}
export default app;
