const fs = require('fs');

function addPDFExport(filePath, docTitlePrefix) {
  let code = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Add import
  if (!code.includes("import { useReactToPrint }")) {
      code = code.replace(
        "import React,",
        "import React,"
      ); // Dummy to ensure we can just append
      
      const lastImport = code.lastIndexOf("import ");
      const endOfLastImport = code.indexOf("\\n", lastImport) !== -1 ? code.indexOf("\\n", lastImport) : code.indexOf(";", lastImport);
      
      code = code.substring(0, endOfLastImport + 1) + "\\nimport { useReactToPrint } from 'react-to-print';\\n" + code.substring(endOfLastImport + 1);
  }
}
