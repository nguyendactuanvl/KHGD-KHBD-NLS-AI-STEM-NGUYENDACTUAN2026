const fs = require('fs');

const filePath = 'src/pages/Worksheets.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const target = `<button
                  onClick={handleExportWord}
                  className={cn(
                    "px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors",
                    isEditing ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  title={isEditing ? "Chuyển sang chế độ xem trước để tải xuống" : ""}
                >
                  <Download className="w-4 h-4" /> Tải Word
                </button>`;

const replacement = `<button
                  onClick={handleExportWord}
                  className={cn(
                    "px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors",
                    isEditing ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  title={isEditing ? "Chuyển sang chế độ xem trước để tải xuống" : ""}
                >
                  <Download className="w-4 h-4" /> Tải Word
                </button>
                <button
                  onClick={() => handleExportPDF()}
                  className={cn(
                    "px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm transition-colors",
                    isEditing ? "bg-slate-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
                  )}
                  title={isEditing ? "Chuyển sang chế độ xem trước để tải xuống PDF" : ""}
                >
                  <span className="text-xs font-bold border-2 border-current px-1 rounded">PDF</span>
                </button>`;

if (code.includes('onClick={handleExportWord}')) {
    code = code.replace(target, replacement);
    fs.writeFileSync(filePath, code);
    console.log('Fixed Worksheets.tsx buttons');
} else {
    console.log('Could not find target in Worksheets.tsx');
}
