const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('PdfToWord')) {
  code = code.replace(
    "import { ExerciseSolver } from './pages/ExerciseSolver';",
    "import { ExerciseSolver } from './pages/ExerciseSolver';\nimport { PdfToWord } from './pages/PdfToWord';"
  );
  
  code = code.replace(
    "{activeTab === \"exercise\" && <ExerciseSolver />}",
    "{activeTab === \"exercise\" && <ExerciseSolver />}\n        {activeTab === \"pdf2word\" && <PdfToWord />}"
  );
}

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx");
