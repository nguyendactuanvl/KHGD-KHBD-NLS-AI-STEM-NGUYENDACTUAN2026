import re

with open("api/generate-exam.ts", "r") as f:
    code = f.read()

replacement = """
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
"""

code = re.sub(r'return \{\s*id: q\.id \|\| idx \+ 1,\s*number: idx \+ 1,\s*type: type,\s*content: questionText,\s*options: choices,\s*correct: rightAns,\s*correctAnswer: correctAnsStr,\s*correctOptionIndex: correctOptionIndex,\s*explanation: explain\s*\};', replacement.strip(), code)

schema_replacement = """
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.NUMBER },
                    correctAnswer: { type: Type.STRING },
                    level: { type: Type.STRING },
                    topic: { type: Type.STRING, description: "Chủ đề/Chương" },
                    subtopic: { type: Type.STRING, description: "Nội dung/Đơn vị kiến thức" },
                    explanation: { type: Type.STRING }
                  },
                  required: ["id", "type", "content", "level", "topic", "subtopic"]
                }
              }
            }
          }
"""

code = re.sub(r'responseSchema: \{\s*type: Type\.OBJECT,\s*properties: \{\s*title: \{ type: Type\.STRING \},\s*questions: \{\s*type: Type\.ARRAY,\s*items: \{\s*type: Type\.OBJECT,\s*properties: \{\s*id: \{ type: Type\.NUMBER \},[\s\S]*?required: \["id", "type", "content", "level"\]\s*\}\s*\}\s*\}\s*\}', schema_replacement.strip(), code)


with open("api/generate-exam.ts", "w") as f:
    f.write(code)

print("patched")
