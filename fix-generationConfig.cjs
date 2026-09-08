const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (code.includes('generationConfig: {')) {
  code = code.replace(/generationConfig: \{/g, 'config: {');
  fs.writeFileSync('server.ts', code);
  console.log('Fixed generationConfig to config');
}
