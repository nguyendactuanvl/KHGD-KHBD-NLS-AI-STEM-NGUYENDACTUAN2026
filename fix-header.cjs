const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

const oldStr = `<div className="bg-slate-100 px-6 py-4 flex justify-between items-center border-b border-slate-200">
                          <h4 className="font-bold text-lg text-slate-800">Mã đề: {exam.code}</h4>
                          <button onClick={() => handlePrint(\`print-exam-\${exam.code}\`)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">
                            <Printer className="w-4 h-4" /> In / PDF
                          </button>
                          <button onClick={() => handleExportWord(\`print-exam-\${exam.code}\`, exam.code)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Xuất Word
                          </button>
                          </div>
                        </div>`;

const newStr = `<div className="bg-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200">
                          <h4 className="font-bold text-lg text-slate-800">Mã đề: {exam.code}</h4>
                          <div className="flex gap-2">
                            <button onClick={() => handlePrint(\`print-exam-\${exam.code}\`)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">
                              <Printer className="w-4 h-4" /> In / PDF
                            </button>
                            <button onClick={() => handleExportWord(\`print-exam-\${exam.code}\`, exam.code)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">
                              <Download className="w-4 h-4" /> Xuất Word
                            </button>
                          </div>
                        </div>`;

// If exact replace fails, we can use regex
code = code.replace(/<div className="bg-slate-100[\s\S]*?<\/div>\s*<\/div>\s*<div className="p-6">/, newStr + '\n                        <div className="p-6">');
fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
