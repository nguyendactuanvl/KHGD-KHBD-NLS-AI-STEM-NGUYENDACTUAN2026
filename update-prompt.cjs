const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldPrompt = `2. CHUYỂN TOÀN BỘ CÔNG THỨC Toán học, Vật lý, Hóa học sang định dạng chuẩn LaTeX:
   - Sử dụng một dấu $ (VD: $x^2 + 1 = 0$) cho công thức nằm trong dòng chữ.
   - Sử dụng hai dấu $$ (VD: $$\\int_0^1 x dx$$) cho công thức đứng riêng một dòng.
   - KHÔNG dùng ký tự Unicode mô phỏng công thức (như x² hay ½).`;

const newPrompt = `2. CHUYỂN TOÀN BỘ CÔNG THỨC, KÝ HIỆU Toán học, Vật lý, Hóa học sang định dạng chuẩn LaTeX:
   - TẤT CẢ các biến số (VD: $x, y, V, S$), các giá trị đại lượng (VD: $500\\text{ cm}^3, 50\\text{ kg}$), biểu thức, phương trình ĐỀU PHẢI được bọc trong dấu $.
   - Sử dụng một dấu $ (VD: $x^2 + 1 = 0$) cho công thức/ký hiệu nằm trong dòng chữ.
   - Sử dụng hai dấu $$ (VD: $$\\int_0^1 x dx$$) cho công thức đứng riêng một dòng.
   - KHÔNG dùng ký tự Unicode mô phỏng công thức (như x² hay ½).`;

code = code.replace(oldPrompt, newPrompt);
fs.writeFileSync('server.ts', code);
console.log("Updated prompt in server.ts");
