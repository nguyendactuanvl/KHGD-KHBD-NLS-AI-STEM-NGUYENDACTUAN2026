const fs = require('fs');

let content = fs.readFileSync('src/pages/EducationalPlan.tsx', 'utf8');
content = content.replace('px-8 py-6', 'px-4 lg:px-8 py-4 lg:py-6');
content = content.replace('className="p-8"', 'className="p-4 lg:p-8"');
content = content.replace('className="flex justify-between items-center"', 'className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"');

fs.writeFileSync('src/pages/EducationalPlan.tsx', content);
console.log('EducationalPlan updated');
