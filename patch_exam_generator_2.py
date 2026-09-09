import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

prompt_old = """      const response = await fetch("/api/generate-exam", {
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
      });"""

prompt_new = """      let finalPrompt = advancedPrompt;
      if (generateMode === "from_matrix_file") {
        finalPrompt += "\\n\\nYÊU CẦU QUAN TRỌNG: Hãy sử dụng file đính kèm làm ma trận đề. Soạn các câu hỏi bám sát theo cấu trúc, số lượng câu, mức độ và nội dung được quy định trong file ma trận tải lên này.";
      }

      const response = await fetch("/api/generate-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey
        },
        body: JSON.stringify({ 
          subject, grade, duration, examType, matrix, customPrompt: finalPrompt,
          qCounts: activeQCounts,
          matrixFile: matrixBase64,
          selectedTopics
        })
      });"""

code = code.replace(prompt_old, prompt_new)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched 2")
