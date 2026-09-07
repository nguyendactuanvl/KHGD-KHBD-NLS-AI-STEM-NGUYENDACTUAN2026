const fs = require('fs');

let content = fs.readFileSync('src/pages/Worksheets.tsx', 'utf8');
content = content.replace('className="flex h-full bg-slate-50"', 'className="flex flex-col lg:flex-row h-full bg-slate-50 overflow-hidden"');
content = content.replace('className="w-[400px] border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden shrink-0"', 'className="w-full lg:w-[400px] lg:border-r border-b lg:border-b-0 border-slate-200 bg-white flex flex-col h-auto lg:h-full overflow-hidden shrink-0"');

// also we might need to handle the case where it takes too much vertical space on mobile and hides the content.
// wait, the worksheets sidebar has flex-1 overflow-y-auto, so it can scroll within itself. But if it's flex-col on mobile, the first child (settings) should take some height, and the second child (content) should take the rest.
// Wait, if it's h-auto, flex-1 won't work well without a fixed height.
content = content.replace('className="w-full lg:w-[400px] lg:border-r border-b lg:border-b-0 border-slate-200 bg-white flex flex-col h-auto lg:h-full overflow-hidden shrink-0"', 'className="w-full lg:w-[400px] lg:border-r border-b lg:border-b-0 border-slate-200 bg-white flex flex-col h-[50vh] lg:h-full overflow-hidden shrink-0"');

fs.writeFileSync('src/pages/Worksheets.tsx', content);
console.log('Worksheets updated');
