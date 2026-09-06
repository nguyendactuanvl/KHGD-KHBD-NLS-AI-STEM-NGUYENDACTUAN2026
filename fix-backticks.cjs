const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/Sử dụng duy nhất dấu `\$` cho công thức trong dòng \(ví dụ: \$a\+b=c\$\) và `\$\$` cho công thức riêng \(ví dụ: \$\$x\^2\$\$\). Không dùng các ký tự Unicode mô phỏng công thức./g, 'Sử dụng duy nhất dấu \\$ cho công thức trong dòng (ví dụ: $a+b=c$) và \\$\\$ cho công thức riêng (ví dụ: $$x^2$$). Không dùng các ký tự Unicode mô phỏng công thức.');

code = code.replace(/Sử dụng duy nhất dấu `\$` cho công thức trong dòng và `\$\$` cho công thức riêng./g, 'Sử dụng duy nhất dấu \\$ cho công thức trong dòng và \\$\\$ cho công thức riêng.');

fs.writeFileSync('server.ts', code);
