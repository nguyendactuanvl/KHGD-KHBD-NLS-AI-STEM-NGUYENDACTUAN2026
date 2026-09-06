const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf8');

code = code.replace(
  "        const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];\n        \n        let mimeType = fileType;",
  "        let mimeType = fileType;"
);

fs.writeFileSync('src/pages/LessonPlan.tsx', code);
