const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/a-zA-Z0-9\/+-/g, 'a-zA-Z0-9\/+-.');
fs.writeFileSync('server.ts', code);
console.log('Fixed regex in server.ts');
