const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

const wordFunc = `
  const handleExportWord = (contentId: string, code: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;
    
    const html = \`
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>
      \${printContent.innerHTML}
      </body></html>
    \`;

    const blob = new Blob(['\\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`De_kiem_tra_Ma_\${code}.doc\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

if (!code.includes('handleExportWord')) {
  code = code.replace('const handlePrint =', wordFunc + '\n  const handlePrint =');
  
  code = code.replace('<Printer className="w-4 h-4" /> In / PDF\n                          </button>', '<Printer className="w-4 h-4" /> In / PDF\n                          </button>\n                          <button onClick={() => handleExportWord(`print-exam-${exam.code}`, exam.code)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 flex items-center gap-2">\n                            <Download className="w-4 h-4" /> Xuất Word\n                          </button>');
  
  // also wrap the buttons in a flex container so they look nice
  code = code.replace('<button onClick={() => handlePrint(`print-exam-${exam.code}`)}', '<div className="flex gap-2">\n                            <button onClick={() => handlePrint(`print-exam-${exam.code}`)}');
  code = code.replace('<Download className="w-4 h-4" /> Xuất Word\n                          </button>', '<Download className="w-4 h-4" /> Xuất Word\n                          </button>\n                          </div>');
  
  fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
  console.log('Added export to word');
}
