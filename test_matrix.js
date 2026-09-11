const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const regex = /const response = await generateWithFallback\(req, \{[\s\S]*?contents: \[\{ parts: \[\{ text: promptText \}\] \}\][\s\S]*?\}\);/m;
console.log(regex.test(content));
