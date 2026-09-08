const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

code = code.replace('<title>In Đề Kiểm Tra</title>', '<title>In Đề Kiểm Tra</title>\n          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">');

fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
console.log('Patched print katex');
