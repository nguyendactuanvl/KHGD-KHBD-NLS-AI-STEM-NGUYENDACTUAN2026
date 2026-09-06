const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const marker = 'import path from "path";';
const index = code.lastIndexOf(marker);

let newCode = 'import express from "express";\n' + code.substring(index);

// Fix the math instructions in the rescued code
newCode = newCode.replace(/Đặt công thức trên cùng 1 dòng trong cặp dấu `\$` \(ví dụ: \$x\^2 \+ y\^2 = R\^2\), hoặc trên 1 dòng riêng trong cặp dấu `\$` \(ví dụ: `\$[\s\S]*?\\int f\(x\)dx\$`\)/g, 'Sử dụng duy nhất dấu \\$ cho công thức trong dòng và \\$\\$ cho công thức riêng.');
newCode = newCode.replace(/Sử dụng dấu \$\` cho công thức trong dòng và `\$\$` cho công thức trên một dòng riêng./g, 'Sử dụng duy nhất dấu \\$ cho công thức trong dòng và \\$\\$ cho công thức riêng.');
newCode = newCode.replace(/Sử dụng duy nhất dấu `\$` cho công thức trong dòng \(ví dụ: \$a\+b=c\$\) và `\$\$` cho công thức riêng \(ví dụ: \$\$x\^2\$\$\)\. Không dùng các ký tự Unicode mô phỏng công thức\./g, 'Sử dụng duy nhất dấu \\$ cho công thức trong dòng và \\$\\$ cho công thức riêng.');
newCode = newCode.replace(/Sử dụng duy nhất dấu `\$` cho công thức trong dòng và `\$\$` cho công thức riêng\./g, 'Sử dụng duy nhất dấu \\$ cho công thức trong dòng và \\$\\$ cho công thức riêng.');
newCode = newCode.replace(/Tuyệt đối không dùng \$\\` hoặc \\`\$\./g, '');
newCode = newCode.replace(/Tuyệt đối không dùng \$\\` hay \\`\.\$/g, '');

fs.writeFileSync('server.ts', newCode);
