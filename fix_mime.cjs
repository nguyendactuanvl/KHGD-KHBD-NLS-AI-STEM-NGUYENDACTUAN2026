const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix handleFileUpload
  const oldFunc = `const filesArray = Array.from(e.target.files);\n      filesArray.forEach(file => {\n        const fileType = file.type || '';`;
  const newFunc = `const filesArray = Array.from(e.target.files);\n      filesArray.forEach(file => {\n        const fileType = file.type || '';\n        const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];\n        if (!validTypes.includes(fileType) && !file.name.match(/\\.(pdf|txt|csv|html)$/i)) {\n          alert(\`File "\${file.name}" không được hỗ trợ. Trí tuệ nhân tạo (AI) hiện tại chỉ có thể đọc được các định dạng văn bản chuẩn như PDF, TXT, CSV, HTML. Vui lòng "Lưu dưới dạng" (Save As / Export) file Word/Excel của bạn sang định dạng PDF trước khi tải lên.\`);\n          return;\n        }`;
  
  if (code.includes(oldFunc)) {
    code = code.replace(oldFunc, newFunc);
  } else if (code.includes('const filesArray = Array.from(e.target.files);\n      filesArray.forEach(file => {\n        const reader = new FileReader();')) {
    code = code.replace(
      'const filesArray = Array.from(e.target.files);\n      filesArray.forEach(file => {\n        const reader = new FileReader();',
      `const filesArray = Array.from(e.target.files);\n      filesArray.forEach(file => {\n        const fileType = file.type || '';\n        const validTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];\n        if (!validTypes.includes(fileType) && !file.name.match(/\\.(pdf|txt|csv|html)$/i)) {\n          alert(\`File "\${file.name}" không được hỗ trợ. Trí tuệ nhân tạo (AI) hiện tại chỉ có thể đọc được các định dạng văn bản chuẩn như PDF, TXT, CSV, HTML. Vui lòng "Lưu dưới dạng" (Save As / Export) file Word/Excel của bạn sang định dạng PDF trước khi tải lên.\`);\n          return;\n        }\n        const reader = new FileReader();`
    );
  }

  // Fix accepts
  code = code.replace(/accept="\.pdf,\.txt,\.csv,\.html,\.docx,\.xlsx"/g, 'accept=".pdf,.txt,.csv,.html"');
  code = code.replace(/accept="\.pdf,\.txt,\.csv,\.docx,\.xlsx"/g, 'accept=".pdf,.txt,.csv,.html"');
  code = code.replace(/accept="\.docx,\.xlsx,\.xls"/g, 'accept=".pdf,.txt,.csv,.html"');

  fs.writeFileSync(filePath, code);
}

fixFile('src/pages/EducationalPlan.tsx');
fixFile('src/pages/LessonPlan.tsx');
