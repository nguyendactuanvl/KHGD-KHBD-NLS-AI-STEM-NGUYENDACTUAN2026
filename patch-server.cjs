const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
/const isMath = subject\.toLowerCase\(\)\.includes\('toán'\);\s*let mathPrompt = "";\s*let total = 20;\s*if \(isMath\) \{\s*total = \(qCounts\.mc \|\| 0\) \+ \(qCounts\.tf \|\| 0\) \+ \(qCounts\.sa \|\| 0\) \+ \(qCounts\.essay \|\| 0\);\s*mathPrompt = `Cấu trúc đề Toán yêu cầu:\\n- Trắc nghiệm nhiều lựa chọn \(mc\): \$\{qCounts\.mc\} câu\.\\n- Trắc nghiệm Đúng\/Sai \(tf\): \$\{qCounts\.tf\} câu \(Mỗi câu gồm 1 mệnh đề chính và 4 ý a,b,c,d để học sinh chọn đúng\/sai\)\.\\n- Trắc nghiệm trả lời ngắn \(sa\): \$\{qCounts\.sa\} câu\.\\n- Tự luận \(essay\): \$\{qCounts\.essay\} câu\.\\n`;\s*if \(selectedTopics && selectedTopics\.length > 0\) \{\s*mathPrompt \+= `\\nCác chủ đề cần tập trung \(lấy từ KHGD\): \$\{selectedTopics\.join\(", "\)\}\\n`;\s*\}\s*\} else \{\s*total = req\.body\.totalQuestions \|\| 20;\s*mathPrompt = `Cấu trúc: \$\{total\} câu trắc nghiệm nhiều lựa chọn \(mc\)\.`;\s*\}/g,
`let total = (qCounts?.mc || 0) + (qCounts?.tf || 0) + (qCounts?.sa || 0) + (qCounts?.essay || 0);
      let mathPrompt = \`Cấu trúc đề yêu cầu:\\n- Trắc nghiệm nhiều lựa chọn (mc): \${qCounts?.mc || 0} câu.\\n- Trắc nghiệm Đúng/Sai (tf): \${qCounts?.tf || 0} câu (Mỗi câu gồm 1 mệnh đề chính và 4 ý a,b,c,d để học sinh chọn đúng/sai).\\n- Trắc nghiệm trả lời ngắn (sa): \${qCounts?.sa || 0} câu.\\n- Tự luận (essay): \${qCounts?.essay || 0} câu.\\n\`;
      if (selectedTopics && selectedTopics.length > 0) {
        mathPrompt += \`\\nCác chủ đề cần tập trung (lấy từ KHGD): \${selectedTopics.join(", ")}\\n\`;
      }`
);

fs.writeFileSync('server.ts', code);
console.log('patched');
