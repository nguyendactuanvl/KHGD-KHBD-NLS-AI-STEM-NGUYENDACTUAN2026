const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/*.tsx');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Remove useReactToPrint import
  code = code.replace(/import\s+{\s*useReactToPrint\s*}\s+from\s+['"]react-to-print['"];?/g, '');
  
  // Add printElement import if not present
  if (!code.includes('import { printElement } from')) {
    // find last import
    const lastImportIndex = code.lastIndexOf('import ');
    const endOfLastImport = code.indexOf('\n', lastImportIndex);
    code = code.substring(0, endOfLastImport + 1) + "import { printElement } from '../lib/print';\n" + code.substring(endOfLastImport + 1);
  }
  
  // Replace handleExportPDF definition
  // Regex to match: const handleExportPDF = useReactToPrint({ ... });
  const reactToPrintRegex = /const handleExportPDF = useReactToPrint\(\s*\{[\s\S]*?\}\s*\);/g;
  
  // We need to figure out the documentTitle for each file.
  let title = "Tai_lieu";
  if (file.includes('ExerciseSolver')) title = "LoiGiai_ChiTiet";
  if (file.includes('HistoryPage')) title = "Lich_su";
  
  const replacement = `const handleExportPDF = () => {
    printElement(exportRef.current, "${title}");
  };`;
  
  code = code.replace(reactToPrintRegex, replacement);
  
  // Also fix onClick={() => handleExportPDF()} to just onClick={handleExportPDF} if we want, or leave it.
  
  fs.writeFileSync(file, code);
  console.log("Updated", file);
});
