const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// For Lesson Plan
code = code.replace(/Đặt công thức trên cùng 1 dòng trong cặp dấu `\$` \(ví dụ: \$x\^2 \+ y\^2 = R\^2\), hoặc trên 1 dòng riêng trong cặp dấu `\$` \(ví dụ: `\$[\s\S]*?\\int f\(x\)dx\$`\)/g, 'Sử dụng dấu `$` cho công thức trong dòng (ví dụ: $a+b=c$) và `$$` cho công thức riêng (ví dụ: $$x^2$$). Tuyệt đối không dùng $\\` hay \\`.$');

// For Worksheet
code = code.replace(/Sử dụng dấu \\\$\\` cho công thức trong dòng và \\`\$\$\\` cho công thức trên một dòng riêng/g, 'Sử dụng dấu `$` cho công thức trong dòng (ví dụ: $a+b=c$) và `$$` cho công thức riêng (ví dụ: $$x^2$$). Tuyệt đối không dùng $\\` hay \\`.$');

fs.writeFileSync('server.ts', code);
