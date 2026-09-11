const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = "console.log('Received payload:', body);";
if (content.includes(target)) {
  content = content.replace(target, "require('fs').writeFileSync('payload.log', JSON.stringify(body, null, 2));");
  fs.writeFileSync('server.ts', content);
  console.log("Added writeFileSync");
} else {
  console.log("Target not found");
}
