const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove pollinations.ai from both prompts
code = code.replace(/5\. \*\*Hình vẽ minh họa\*\*.*?\n/g, '');

// 2. Modify /api/generate-lesson-plan
code = code.replace(
  'const { lesson, requirement, digitalComp, aiComp, stem, grade } = req.body;',
  'const { lesson, requirement, digitalComp, aiComp, stem, grade, subject } = req.body;'
);
code = code.replace(
  'Hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}" (Khối lớp ${grade}).',
  'Hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn ${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}" (Khối lớp ${grade}).'
);

// 3. Modify /api/generate-lesson-plan-file
code = code.replace(
  'const { lesson, fileData, fileMimeType } = req.body;',
  'const { lesson, subject, files } = req.body;'
);
code = code.replace(
  'Hãy tìm trong tài liệu này bài học có tên (hoặc gần giống với): "${lesson}".',
  'Dựa vào các tài liệu được cung cấp (Sách, Văn bản, KHDH...), hãy soạn chi tiết một Kế hoạch bài dạy (Giáo án) môn ${subject || "chung"} theo chuẩn Công văn 5512/BGDĐT-GDTrH cho bài học: "${lesson}".'
);

code = code.replace(
  `        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: fileData,
                  mimeType: fileMimeType
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],`,
  `        contents: [
          {
            role: "user",
            parts: [
              ...(files || []).map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ],`
);

// 4. Modify /api/generate-plan
code = code.replace(
  'const { subject, grade, topic } = req.body;',
  'const { subject, grade, topic, files } = req.body;'
);
code = code.replace(
  `      const response = await generateWithFallback(req, {
        contents: prompt,
        config: {`,
  `      let contents: any = prompt;
      if (files && files.length > 0) {
        contents = [
          {
            role: "user",
            parts: [
              ...files.map((f: any) => ({
                inlineData: {
                  data: f.data,
                  mimeType: f.type || 'text/plain'
                }
              })),
              {
                text: prompt
              }
            ]
          }
        ];
      }
      const response = await generateWithFallback(req, {
        contents: contents,
        config: {`
);

fs.writeFileSync('server.ts', code);
