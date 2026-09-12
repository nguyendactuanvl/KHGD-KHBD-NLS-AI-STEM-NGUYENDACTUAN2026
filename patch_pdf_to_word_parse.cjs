const fs = require('fs');

const pdfToWordPath = 'src/pages/PdfToWord.tsx';
let content = fs.readFileSync(pdfToWordPath, 'utf8');

// Replace standard throw to handle text response as well if json fails
const targetThrow = `      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi xử lý file');
      }`;

const newThrow = `      if (!response.ok) {
        let errorData;
        try {
           errorData = await response.json();
        } catch {
           errorData = { error: await response.text() };
        }
        
        let errorMsg = errorData.error || 'Có lỗi xảy ra khi xử lý file';
        if (typeof errorMsg === 'object') errorMsg = JSON.stringify(errorMsg);
        throw new Error(errorMsg);
      }`;

if (content.includes(targetThrow)) {
  content = content.replace(targetThrow, newThrow);
  fs.writeFileSync(pdfToWordPath, content);
  console.log('Patched PdfToWord throw');
}

