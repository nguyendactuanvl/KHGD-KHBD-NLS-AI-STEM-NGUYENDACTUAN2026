const fs = require('fs');
let code = fs.readFileSync('src/pages/WeeklyTimetable.tsx', 'utf8');
code = code.replace("className={\`flex items-start gap-3 p-2 rounded-lg border", "className={\`group flex items-start gap-3 p-2 rounded-lg border");
fs.writeFileSync('src/pages/WeeklyTimetable.tsx', code);
