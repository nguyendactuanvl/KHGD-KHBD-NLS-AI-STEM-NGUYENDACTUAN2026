const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Toán học và công thức')) {
        lines[i] = '4. **Toán học và công thức**: Bắt buộc sử dụng chuẩn LaTeX. Sử dụng duy nhất dấu `$` cho công thức trong dòng (ví dụ: $a+b=c$) và `$$` cho công thức riêng (ví dụ: $$x^2$$). Không dùng các ký tự Unicode mô phỏng công thức.';
    }
    if (lines[i].includes('Sử dụng dấu \\$\\` cho công thức')) {
        lines[i] = '      5. ĐỐI VỚI CÁC MÔN KHOA HỌC (Toán, Lý, Hóa, Sinh, Tin học): BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học, phương trình phản ứng, hoặc biểu thức. Sử dụng duy nhất dấu `$` cho công thức trong dòng và `$$` cho công thức riêng.';
    }
}

fs.writeFileSync('server.ts', lines.join('\n'));
