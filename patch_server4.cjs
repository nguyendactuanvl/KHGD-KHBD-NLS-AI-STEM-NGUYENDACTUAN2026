const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = "require('fs').writeFileSync('payload.log', JSON.stringify(body, null, 2));";
if (content.includes(target)) {
  content = content.replace(target, "");
  fs.writeFileSync('server.ts', content);
  console.log("Removed require fs");
}
