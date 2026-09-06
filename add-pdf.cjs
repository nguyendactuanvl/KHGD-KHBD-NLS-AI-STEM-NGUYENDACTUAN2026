const fs = require('fs');

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  if (code.includes('handleExportPDF')) return;

  // Add import
  if (!code.includes("useReactToPrint")) {
    const lastImportIndex = code.lastIndexOf("import ");
    const newlineIndex = code.indexOf("\n", lastImportIndex);
    code = code.substring(0, newlineIndex + 1) + "import { useReactToPrint } from 'react-to-print';\n" + code.substring(newlineIndex + 1);
  }

  // Find where to insert handleExportPDF
  const searchStr = "const handleExportWord = ";
  const searchIndex = code.indexOf(searchStr);
  
  if (searchIndex !== -1) {
    let pdfHook = `
  const handleExportPDF = useReactToPrint({
    contentRef: exportRef,
    documentTitle: "Tai_lieu",
  });
`;
    if (filePath.includes('HistoryPage')) {
      pdfHook = `
  const handleExportPDF = useReactToPrint({
    contentRef: exportRef,
    documentTitle: "Lich_su",
  });
`;
    }
    
    code = code.substring(0, searchIndex) + pdfHook + "\n  " + code.substring(searchIndex);
  }

  // Find buttons and insert the PDF button
  // 1. LessonPlan, Worksheets: <Download className="h-5 w-5" />
  // 2. HistoryPage: button next to "Xuất Word"
  // 3. EducationalPlan: button next to "Xuất Word"
  
  // Actually, string replacement for buttons is tricky. Let's do it manually for each file.
  
  fs.writeFileSync(filePath, code);
  console.log('Added handleExportPDF hook to', filePath);
}

processFile('src/pages/LessonPlan.tsx');
processFile('src/pages/Worksheets.tsx');
processFile('src/pages/EducationalPlan.tsx');
processFile('src/pages/HistoryPage.tsx');
