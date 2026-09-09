import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

replacement = """
      const activeQCounts = {
        mc: qEnabled.mc ? qCounts.mc : 0,
        tf: qEnabled.tf ? qCounts.tf : 0,
        sa: qEnabled.sa ? qCounts.sa : 0,
        essay: qEnabled.essay ? qCounts.essay : 0
      };

      const advancedPrompt = `
Mức độ nhận thức yêu cầu:
- Nhận biết: ${levels.nb}%
- Thông hiểu: ${levels.th}%
- Vận dụng: ${levels.vd}%
- Vận dụng cao: ${levels.vdc}%

Yêu cầu xuất ra:
${outputConfig.answers ? "- Có đáp án chi tiết." : ""}
${outputConfig.spec ? "- Kèm theo bảng đặc tả." : ""}
${outputConfig.matrix ? "- Kèm theo ma trận đề." : ""}

${customPrompt}
`.trim();

      const response = await fetch("/api/generate-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey
        },
        body: JSON.stringify({ 
          subject, grade, duration, examType, matrix, customPrompt: advancedPrompt,
          qCounts: activeQCounts,
          matrixFile: matrixBase64,
          selectedTopics
        })
      });
"""

pattern = re.compile(r'const response = await fetch\("/api/generate-exam", \{\s*method: "POST",\s*headers: \{\s*"Content-Type": "application/json",\s*"x-gemini-api-key": apiKey\s*\},\s*body: JSON\.stringify\(\{ \s*subject, grade, duration, examType, matrix, customPrompt,\s*qCounts,\s*matrixFile: matrixBase64,\s*selectedTopics\s*\}\)\s*\}\);')

code = pattern.sub(replacement.strip(), code)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched")
