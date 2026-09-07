const fs = require('fs');

let content = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

content = content.replace('className="flex h-full bg-slate-50"', 'className="flex flex-col lg:flex-row h-full bg-slate-50 overflow-hidden"');
content = content.replace('className="w-1/3 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden"', 'className="w-full lg:w-1/3 lg:border-r border-b lg:border-b-0 border-slate-200 bg-white flex flex-col h-[50vh] lg:h-full overflow-hidden shrink-0"');

fs.writeFileSync('src/pages/HistoryPage.tsx', content);
console.log('HistoryPage updated');
