const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldThrow = `throw new Error("All models failed");`;
const newThrow = `throw new Error("429 RESOURCE_EXHAUSTED All models failed");`;

content = content.replace(oldThrow, newThrow);
fs.writeFileSync('server.ts', content);
