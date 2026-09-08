import re

with open("server.ts", "r") as f:
    code = f.read()

pattern = re.compile(r"const isMath = subject\.toLowerCase\(\)\.includes\('toán'\);.*?}\s*else\s*{.*?mathPrompt = `Cấu trúc: \$\{total\} câu trắc nghiệm nhiều lựa chọn \(mc\)\.`;\s*}", re.DOTALL)

replacement = """let total = (qCounts?.mc || 0) + (qCounts?.tf || 0) + (qCounts?.sa || 0) + (qCounts?.essay || 0);
      let mathPrompt = `Cấu trúc đề yêu cầu:\\n- Trắc nghiệm nhiều lựa chọn (mc): ${qCounts?.mc || 0} câu.\\n- Trắc nghiệm Đúng/Sai (tf): ${qCounts?.tf || 0} câu (Mỗi câu gồm 1 mệnh đề chính và 4 ý a,b,c,d để học sinh chọn đúng/sai).\\n- Trắc nghiệm trả lời ngắn (sa): ${qCounts?.sa || 0} câu.\\n- Tự luận (essay): ${qCounts?.essay || 0} câu.\\n`;
      if (selectedTopics && selectedTopics.length > 0) {
        mathPrompt += `\\nCác chủ đề cần tập trung (lấy từ KHGD): ${selectedTopics.join(", ")}\\n`;
      }"""

new_code = pattern.sub(replacement, code)

with open("server.ts", "w") as f:
    f.write(new_code)

print("Replaced!")
