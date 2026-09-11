const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetFilePrompt = `      const prompt = \`Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Tôi đã tải lên một tài liệu Kế hoạch giáo dục (KHGD).
Dựa vào các tài liệu được cung cấp (Sách, Văn bản, KHDH...), hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn \${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "\${lesson}".
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "\${textbookName}".
Trích xuất các thông tin về:`;

const replacementFilePrompt = `      const prompt = \`Bạn là một giáo viên xuất sắc và chuyên gia giáo dục. Tôi đã tải lên một tài liệu Kế hoạch giáo dục (KHGD).
Dựa vào các tài liệu được cung cấp (Sách, Văn bản, KHDH...), hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn \${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "\${lesson}".
TUYỆT ĐỐI BÁM SÁT VÀ SOẠN CHÍNH XÁC BÀI HỌC CÓ TÊN LÀ: "\${lesson}". KHÔNG ĐƯỢC TỰ Ý ĐỔI SANG BÀI KHÁC.
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "\${textbookName}".
Trích xuất các thông tin về:`;

const targetDirectPrompt = `    // Xây dựng System Prompt chi tiết theo đúng cấu trúc CV 5512 & GDPT 2018
    const promptText = body.customPrompt || \`Bạn là chuyên gia sư phạm môn \${subject} chương trình GDPT 2018. Hãy soạn một Kế hoạch bài dạy (Giáo án) chi tiết, chỉn chu, đúng chuẩn Công văn 5512/BGDĐT-GDTrH.
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "\${textbook}".
Các thông tin cốt lõi của bài học:`;

const replacementDirectPrompt = `    // Xây dựng System Prompt chi tiết theo đúng cấu trúc CV 5512 & GDPT 2018
    const promptText = body.customPrompt || \`Bạn là chuyên gia sư phạm môn \${subject} chương trình GDPT 2018. Hãy soạn một Kế hoạch bài dạy (Giáo án) chi tiết, chỉn chu, đúng chuẩn Công văn 5512/BGDĐT-GDTrH.
TUYỆT ĐỐI BÁM SÁT VÀ SOẠN CHÍNH XÁC BÀI HỌC CÓ TÊN LÀ: "\${topic}". KHÔNG ĐƯỢC ĐỔI SANG BÀI KHÁC HOẶC TỰ Ý THÊM BỚT NỘI DUNG NGOÀI CHỦ ĐỀ NÀY. CHÚ Ý KỸ YÊU CẦU CẦN ĐẠT CỦA BÀI NÀY LÀ GÌ ĐỂ TRÁNH LẠC ĐỀ.
Đặc biệt lưu ý: Vui lòng sử dụng và bám sát nội dung, thuật ngữ, tiến trình của bộ sách giáo khoa: "\${textbook}".
Các thông tin cốt lõi của bài học:`;

content = content.replace(targetFilePrompt, replacementFilePrompt);
content = content.replace(targetDirectPrompt, replacementDirectPrompt);
fs.writeFileSync('server.ts', content);
