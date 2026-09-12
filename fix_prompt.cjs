const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = `**Tuyệt đối KHÔNG sử dụng thẻ HTML \`<br>\` hoặc \`<br/>\`**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
**Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML \`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\` để tô màu xanh nổi bật.`;
const replacement1 = `**Tuyệt đối KHÔNG sử dụng thẻ HTML <br> hoặc <br/>**: Hãy sử dụng dấu xuống dòng chuẩn của Markdown (Enter 2 lần) để ngắt đoạn.
**Tô màu Năng lực số (NLS) và Năng lực AI**: Khi nhắc đến phần mềm, công cụ thiết bị số, Năng lực số hoặc công cụ AI trong bài, BẮT BUỘC phải bọc trong thẻ HTML <mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark> để tô màu xanh nổi bật.`;

content = content.replace(target1, replacement1);
content = content.replace(target1, replacement1); // Replace both occurrences

fs.writeFileSync('server.ts', content);
