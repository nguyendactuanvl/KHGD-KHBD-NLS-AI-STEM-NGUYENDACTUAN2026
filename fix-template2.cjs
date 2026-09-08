const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const correctLine2 = "2. **Tuyệt đối KHÔNG sử dụng thẻ HTML \\`<br>\\` hoặc \\`<br/>\\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.";
const correctLine3 = "3. **Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \\`<mark style=\"background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;\">Tên phần mềm / NLS</mark>\\` để tô màu xanh nổi bật.";

code = code.replace(/2\. \*\*Tuyệt đối KHÔNG sử dụng thẻ HTML.*để ngắt đoạn\./g, correctLine2);
code = code.replace(/3\. \*\*Tô màu Năng lực số.*để tô màu xanh nổi bật\./g, correctLine3);

fs.writeFileSync('server.ts', code);
