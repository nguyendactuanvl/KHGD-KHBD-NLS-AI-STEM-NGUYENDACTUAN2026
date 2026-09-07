const fs = require('fs');

let content = fs.readFileSync('src/pages/Circulars.tsx', 'utf8');
content = content.replace('p-8"', 'p-4 lg:p-8"');
content = content.replace('p-6 ', 'p-4 lg:p-6 ');

fs.writeFileSync('src/pages/Circulars.tsx', content);
console.log('Circulars updated');
