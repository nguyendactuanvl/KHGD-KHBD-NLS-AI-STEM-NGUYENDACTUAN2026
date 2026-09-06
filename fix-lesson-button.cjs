const fs = require('fs');

const filePath = 'src/pages/LessonPlan.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const target = `<button 
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Tải xuống Word"
            onClick={handleExportWord}
            disabled={!suggestion}
          >
            <Download className="h-5 w-5" />
          </button>`;

const replacement = `<button 
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Tải xuống Word"
            onClick={handleExportWord}
            disabled={!suggestion}
          >
            <Download className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Xuất PDF"
            onClick={() => handleExportPDF()}
            disabled={!suggestion}
          >
            <span className="text-sm font-bold border-2 border-current px-1 rounded">PDF</span>
          </button>`;

if (code.includes('Tải xuống Word')) {
    code = code.replace(target, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Fixed LessonPlan.tsx buttons');
} else {
    console.log('Could not find target in LessonPlan.tsx');
}
