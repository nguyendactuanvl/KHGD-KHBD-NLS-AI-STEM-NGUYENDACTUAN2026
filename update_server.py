import re

with open("server.ts", "r") as f:
    code = f.read()

schema_pattern = re.compile(r'properties: \{\s*id: \{\s*type: Type\.NUMBER\s*\},[\s\S]*?required: \["id", "type", "content", "level"\]')
schema_properties = """properties: {
                    id: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.NUMBER },
                    correctAnswer: { type: Type.STRING },
                    level: { type: Type.STRING },
                    topic: { type: Type.STRING, description: "Chủ đề hoặc Chương. Bắt buộc." },
                    subtopic: { type: Type.STRING, description: "Nội dung hoặc Đơn vị kiến thức. Bắt buộc." },
                    explanation: { type: Type.STRING }
                  },
                  required: ["id", "type", "content", "level", "topic", "subtopic"]"""

if schema_pattern.search(code):
    code = schema_pattern.sub(schema_properties, code)
    print("Schema patched.")
else:
    print("Pattern not found!")

# We also need to map topic and subtopic in the mapping code inside server.ts
# Let's check the mapping part

with open("server.ts", "w") as f:
    f.write(code)

