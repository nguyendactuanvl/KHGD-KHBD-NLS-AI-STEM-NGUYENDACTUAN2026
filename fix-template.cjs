const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace unescaped backticks inside the template literals
code = code.replace(/<br>/g, '\\`<br>\\`');
code = code.replace(/<br\/>/g, '\\`<br/>\\`');
code = code.replace(/<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm \/ NLS<\/mark>/g, '\\`<mark style="background-color: #dbeafe; color: #1d4ed8; font-weight: bold; padding: 2px 4px; border-radius: 4px;">Tên phần mềm / NLS</mark>\\`');

// Clean up double backticks just in case
code = code.replace(/\\`\\`<br>\\`\\`/g, '\\`<br>\\`');
code = code.replace(/\\`\\`<br\/>\\`\\`/g, '\\`<br/>\\`');
code = code.replace(/`\\`<mark/g, '\\`<mark');
code = code.replace(/mark>\\``/g, 'mark>\\`');

// I also notice in the output above:
// `\`<mark style=...
// meaning it became `` \`<mark ``. I should just fix the whole string manually.

fs.writeFileSync('server.ts', code);
