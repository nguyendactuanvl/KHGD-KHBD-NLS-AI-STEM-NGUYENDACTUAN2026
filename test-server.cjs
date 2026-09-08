const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /Tuyệt đối KHÔNG sử dụng thẻ HTML (.*?) hoặc (.*?) \*\*/g;
let match;
while ((match = regex.exec(code)) !== null) {
  console.log("MATCH 1:", match[1]);
  console.log("MATCH 2:", match[2]);
}
