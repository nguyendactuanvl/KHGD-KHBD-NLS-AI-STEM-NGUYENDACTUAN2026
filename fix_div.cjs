const fs = require('fs');
let code = fs.readFileSync('src/pages/EducationalPlan.tsx', 'utf8');

code = code.replace(
  '<div className="flex justify-between items-center">\n          <div>\n            <div className="flex-1">',
  '<div className="flex justify-between items-center">\n            <div className="flex-1">'
);

fs.writeFileSync('src/pages/EducationalPlan.tsx', code);
