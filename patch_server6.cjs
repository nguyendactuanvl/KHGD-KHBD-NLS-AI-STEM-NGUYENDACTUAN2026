const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = "const grade = body.grade || 'Lớp 10';";
const replacement = "const grade = body.grade ? (typeof body.grade === 'number' ? `Lớp ${body.grade}` : body.grade) : 'Lớp 10';";

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('server.ts', content);
  console.log("Grade patched");
}
