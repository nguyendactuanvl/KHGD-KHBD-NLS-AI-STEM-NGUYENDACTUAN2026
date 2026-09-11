const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/return handleAiError\(error, req, res\);\s*\}\);/g, 'return handleAiError(error, req, res);\n    }\n  });');

fs.writeFileSync('server.ts', content);
