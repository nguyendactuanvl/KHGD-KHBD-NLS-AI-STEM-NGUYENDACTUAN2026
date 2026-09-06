const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The problematic string I injected:
const badStr = "Sử dụng duy nhất dấu `$` cho công thức trong dòng và `$$` cho công thức riêng.";
const goodStr = "Sử dụng duy nhất dấu \\`$\\` cho công thức trong dòng và \\`$$\\` cho công thức riêng.";
code = code.split(badStr).join(goodStr);

const badStr2 = "Sử dụng duy nhất dấu `$` cho công thức trong dòng (ví dụ: $a+b=c$) và `$$` cho công thức riêng (ví dụ: $$x^2$$). Không dùng các ký tự Unicode mô phỏng công thức.";
const goodStr2 = "Sử dụng duy nhất dấu \\`$\\` cho công thức trong dòng (ví dụ: $a+b=c$) và \\`$$\\` cho công thức riêng (ví dụ: $$x^2$$). Không dùng các ký tự Unicode mô phỏng công thức.";
code = code.split(badStr2).join(goodStr2);

fs.writeFileSync('server.ts', code);
