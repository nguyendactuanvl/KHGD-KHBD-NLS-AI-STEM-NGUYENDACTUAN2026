const fs = require('fs');

const pdfToWordPath = 'api/pdf-to-word.ts';
let content = fs.readFileSync(pdfToWordPath, 'utf8');

// The line is: res.status(429).json({ error: "Hệ thống đang bận, vui lòng thử lại sau." });
// Let's replace it with a more informative error message that we can catch
content = content.replace(/res\.status\(429\)\.json\(\{ error: "Hệ thống đang bận, vui lòng thử lại sau\." \}\);/g, 'return res.status(429).json({ error: error.message || "Hệ thống đang quá tải hoặc tạm thời không khả dụng do nhu cầu cao (429). Vui lòng thử lại sau ít phút hoặc sử dụng API Key cá nhân." });');
fs.writeFileSync(pdfToWordPath, content);
console.log('Patched api/pdf-to-word.ts');

