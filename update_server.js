const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const schemaProperties = `properties: {
                    id: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.NUMBER },
                    correctAnswer: { type: Type.STRING },
                    level: { type: Type.STRING },
                    topic: { type: Type.STRING, description: "Chủ đề hoặc Chương. Bắt buộc." },
                    subtopic: { type: Type.STRING, description: "Nội dung hoặc Đơn vị kiến thức. Bắt buộc." }
                  },
                  required: ["id", "type", "content", "level", "topic", "subtopic"]`;

code = code.replace(/properties:\s*\{\s*id:\s*\{\s*type:\s*Type\.NUMBER\s*\},[\s\S]*?required:\s*\["id",\s*"type",\s*"content",\s*"level"\]/, schemaProperties);

fs.writeFileSync('server.ts', code);
console.log('patched');
