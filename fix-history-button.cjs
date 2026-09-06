const fs = require('fs');

const filePath = 'src/pages/HistoryPage.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const target = `<button 
                onClick={() => handleExportWord(viewingItem)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Tải Word (.doc)</span>
              </button>`;

const replacement = `<button 
                onClick={() => handleExportWord(viewingItem)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Tải Word (.doc)</span>
              </button>
              <button 
                onClick={() => handleExportPDF()}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
              >
                <span className="text-xs font-bold border-2 border-current px-1 rounded">PDF</span>
                <span>Tải PDF</span>
              </button>`;

if (code.includes('Tải Word (.doc)')) {
    code = code.replace(target, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Fixed HistoryPage.tsx buttons');
} else {
    console.log('Could not find target in HistoryPage.tsx');
}
