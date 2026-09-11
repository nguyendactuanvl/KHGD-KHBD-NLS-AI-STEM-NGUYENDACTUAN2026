const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    // Thu thập đầy đủ dữ liệu từ form giao diện gửi lên
    const topic = body.topic || body.lessonName || 'Mệnh đề';
    const grade = body.grade || 'Lớp 10';
    const periods = body.periods || body.numPeriods || 4;
    const requirements = body.requirements || body.objectives || body.details || '';
    const digitalCompetence = body.digitalCompetence || '1.1.NC1a: Kiểm tra tính logic của mệnh đề.';
    const aiCompetence = body.aiCompetence || '10.C2.3; 10.C3.2: Phân tích logic và kiểm tra mệnh đề qua ChatGPT/Gemini.';
    const stem = body.stem || 'Có';
    const textbook = body.textbook || 'Kết nối tri thức với cuộc sống';

    // Xây dựng System Prompt chi tiết theo đúng cấu trúc CV 5512 & GDPT 2018
    const promptText = body.customPrompt || \`Bạn là chuyên gia sư phạm Toán học chương trình GDPT 2018. Hãy soạn một Kế hoạch bài dạy (Giáo án) chi tiết, chỉn chu, đúng chuẩn Công văn 5512/BGDĐT-GDTrH.`;

const newCode = `    // Thu thập đầy đủ dữ liệu từ form giao diện gửi lên
    const topic = body.lesson || body.topic || body.lessonName || 'Mệnh đề';
    const grade = body.grade || 'Lớp 10';
    const periods = body.periods || body.numPeriods || 4;
    const requirements = body.requirement || body.requirements || body.objectives || body.details || '';
    const digitalCompetence = body.digitalComp || body.digitalCompetence || 'Không yêu cầu';
    const aiCompetence = body.aiComp || body.aiCompetence || 'Không yêu cầu';
    const stem = body.stem || 'Không yêu cầu';
    const textbook = body.textbook || 'Kết nối tri thức với cuộc sống';
    const subject = body.subject || 'Toán học';

    // Xây dựng System Prompt chi tiết theo đúng cấu trúc CV 5512 & GDPT 2018
    const promptText = body.customPrompt || \`Bạn là chuyên gia sư phạm môn \${subject} chương trình GDPT 2018. Hãy soạn một Kế hoạch bài dạy (Giáo án) chi tiết, chỉn chu, đúng chuẩn Công văn 5512/BGDĐT-GDTrH.`;

content = content.replace(oldCode, newCode);

const oldPromptPart2 = `   - Năng lực toán học (Tư duy và lập luận toán học, Mô hình hóa toán học, Giải quyết vấn đề toán học, Giao tiếp toán học, Sử dụng công cụ phương tiện học toán).`;
const newPromptPart2 = `   - Năng lực đặc thù của môn học (đối với Toán là Tư duy và lập luận, Mô hình hóa, Giải quyết vấn đề, Giao tiếp, Sử dụng công cụ).`;
content = content.replace(oldPromptPart2, newPromptPart2);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts successfully");
