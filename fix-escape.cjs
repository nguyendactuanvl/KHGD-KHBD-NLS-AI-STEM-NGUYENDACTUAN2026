const fs = require('fs');
let code = fs.readFileSync('src/pages/Worksheets.tsx', 'utf-8');

code = code.replace(/\\\`/g, "\`");
code = code.replace(/\\\$/g, "$"); // also check \$

fs.writeFileSync('src/pages/Worksheets.tsx', code);
console.log("Fixed backticks and dollars");
