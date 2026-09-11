const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace("return res.status(500).json({ error: errorMsg });", "return res.status(500).json({ error: errorMsg, stack: err.stack });");
fs.writeFileSync('server.ts', content);
