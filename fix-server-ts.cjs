const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace('const parts = [{ text: promptText }];', 'const parts: any[] = [{ text: promptText }];');
fs.writeFileSync('server.ts', code);
