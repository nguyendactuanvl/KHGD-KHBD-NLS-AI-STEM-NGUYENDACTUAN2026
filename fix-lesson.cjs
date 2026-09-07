const fs = require('fs');

let content = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf8');

content = content.replace('className="flex-1 bg-slate-50 min-h-screen p-8 flex gap-8"', 'className="flex-1 bg-slate-50 min-h-screen p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8 overflow-y-auto"');
content = content.replace('className="w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm self-start flex flex-col gap-6"', 'className="w-full lg:w-1/3 bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm self-start flex flex-col gap-6 shrink-0"');

// Fix the main content area (right side)
// Usually it's `<div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[800px]">`
content = content.replace('className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[800px]"', 'className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] lg:min-h-[800px] w-full"');

fs.writeFileSync('src/pages/LessonPlan.tsx', content);
console.log('LessonPlan updated');
