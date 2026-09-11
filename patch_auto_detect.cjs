const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldPrompt = "let mathPrompt = `Cấu trúc đề yêu cầu:\\n- Trắc nghiệm nhiều lựa chọn (mc): ${mc} câu.\\n- Trắc nghiệm Đúng/Sai (tf): ${tf} câu.\\n- Trắc nghiệm trả lời ngắn (sa): ${sa} câu.\\n- Tự luận (essay): ${essay} câu.\\n`;";
const newPrompt = "let mathPrompt = body.autoDetectStructure ? '\\nHãy tự động trích xuất đúng cấu trúc và số lượng câu hỏi từ tệp ma trận đính kèm.' : `Cấu trúc đề yêu cầu:\\n- Trắc nghiệm nhiều lựa chọn (mc): ${mc} câu.\\n- Trắc nghiệm Đúng/Sai (tf): ${tf} câu.\\n- Trắc nghiệm trả lời ngắn (sa): ${sa} câu.\\n- Tự luận (essay): ${essay} câu.\\n`;";

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync('server.ts', content);
