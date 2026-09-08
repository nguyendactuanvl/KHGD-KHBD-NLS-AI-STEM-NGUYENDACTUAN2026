const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("data:([a-zA-Z0-9/+-]+);base64", "data:([a-zA-Z0-9/+\\\\-.]+);base64");
fs.writeFileSync('server.ts', code);
console.log('Fixed regex in server.ts');
