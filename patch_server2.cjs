const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = "const topic = body.lesson || body.topic || body.lessonName || 'Mệnh đề';";
if (content.includes(target)) {
  content = content.replace(target, "console.log('Received payload:', body);\n    " + target);
  fs.writeFileSync('server.ts', content);
  console.log("Added console.log");
} else {
  console.log("Target not found");
}
