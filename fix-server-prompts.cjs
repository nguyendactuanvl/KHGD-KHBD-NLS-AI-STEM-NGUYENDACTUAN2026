const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  '5. ĐỐI VỚI CÁC MÔN KHOA HỌC (Toán, Lý, Hóa, Sinh, Tin học): BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học, phương trình phản ứng, hoặc biểu thức. Sử dụng duy nhất dấu \\$ cho công thức trong dòng và \\$\\$ cho công thức riêng.',
  '5. ĐỐI VỚI CÁC MÔN KHOA HỌC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức. TẤT CẢ các biến số (như $x, V$), giá trị (như $500\\text{ cm}^3$) ĐỀU PHẢI bọc trong dấu $. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng.'
);

code = code.replace(
  '5. ĐỐI VỚI CÁC MÔN KHOA HỌC (Toán, Lý, Hóa, Sinh, Tin học): BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức toán học. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng (chữ to, đứng riêng một dòng). KHÔNG sử dụng ký tự Unicode mô phỏng công thức.',
  '5. ĐỐI VỚI CÁC MÔN KHOA HỌC: BẮT BUỘC sử dụng chuẩn LaTeX cho MỌI công thức. TẤT CẢ các biến số (như $x, V$), giá trị (như $500\\text{ cm}^3$) ĐỀU PHẢI bọc trong dấu $. Sử dụng duy nhất dấu $ cho công thức trong dòng và $$ cho công thức riêng.'
);

fs.writeFileSync('server.ts', code);
console.log("Updated all prompts in server.ts");
