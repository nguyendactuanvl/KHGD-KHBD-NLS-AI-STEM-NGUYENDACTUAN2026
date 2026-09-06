const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Fix the response.text in generate-similar route
code = code.replace(/res\.json\(\{ result: response \}\);/, 'res.json({ result: response.text });');

fs.writeFileSync('server.ts', code);
console.log("Fixed response to response.text in server.ts");
