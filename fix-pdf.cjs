const fs = require('fs');

let content = fs.readFileSync('src/pages/PdfToWord.tsx', 'utf8');
content = content.replace('className="max-w-7xl mx-auto space-y-6"', 'className="max-w-7xl mx-auto space-y-6 p-4 lg:p-8"');
content = content.replace('p-8"', 'p-4 lg:p-8"');
content = content.replace('p-12 ', 'p-6 lg:p-12 ');
content = content.replace('p-12"', 'p-6 lg:p-12"');

fs.writeFileSync('src/pages/PdfToWord.tsx', content);
console.log('PdfToWord updated');
