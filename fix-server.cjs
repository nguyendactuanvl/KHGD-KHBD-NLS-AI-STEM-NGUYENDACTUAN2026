const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The template literal is broken. 
// We can just replace the problematic lines.
code = code.replace(/Tuyệt đối KHÔNG sử dụng thẻ HTML <br> hoặc <br\/>/g, 'Tuyệt đối KHÔNG sử dụng thẻ HTML \\`<br>\\` hoặc \\`<br/>\\`');
code = code.replace(/<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm \/ NLS<\/mark>/g, '\\`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\\`');

fs.writeFileSync('server.ts', code);
