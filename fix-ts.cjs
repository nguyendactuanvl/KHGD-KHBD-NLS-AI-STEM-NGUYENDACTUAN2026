const fs = require('fs');

let code = fs.readFileSync('src/pages/Worksheets.tsx', 'utf-8');
code = code.replace(
  'const clone = exportRef.current.cloneNode(true);',
  'const clone = exportRef.current.cloneNode(true) as HTMLElement;'
);
fs.writeFileSync('src/pages/Worksheets.tsx', code);
console.log('Fixed Worksheets.tsx type');
