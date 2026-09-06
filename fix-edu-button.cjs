const fs = require('fs');

const filePath = 'src/pages/EducationalPlan.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const target = `<button 
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Xuất Word
            </button>`;

const replacement = `<button 
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Xuất Word
            </button>
            <button 
              onClick={() => handleExportPDF()}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <span className="text-xs font-bold border-2 border-current px-1 rounded">PDF</span>
              Xuất PDF
            </button>`;

if (code.includes('onClick={handleExportWord}')) {
    code = code.replace(target, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Fixed EducationalPlan.tsx buttons');
} else {
    console.log('Could not find target in EducationalPlan.tsx');
}
