const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const models = ["gemini-2.5-flash", "gemini-2.5-pro"];',
  'const models = ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-1.5-flash"];'
);

fs.writeFileSync('server.ts', content);
