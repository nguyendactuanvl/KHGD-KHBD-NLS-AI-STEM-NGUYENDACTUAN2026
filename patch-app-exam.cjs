const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('StudentExamView')) {
  // Imports
  const imports = `import { ExamGenerator } from './pages/ExamGenerator';\nimport { StudentExamView } from './pages/StudentExamView';\n`;
  code = code.replace('import { PdfToWord } from \'./pages/PdfToWord\';', `import { PdfToWord } from './pages/PdfToWord';\n${imports}`);

  // check for student view
  const studentViewCheck = `
  const urlParams = new URLSearchParams(window.location.search);
  const studentExamId = urlParams.get('examId');
  if (studentExamId) {
    return <StudentExamView examId={studentExamId} />;
  }
  `;
  
  code = code.replace('return (', `${studentViewCheck}\n  return (`);
  
  // Add exam to main switch
  code = code.replace('{activeTab === "pdf2word" && <PdfToWord />}', '{activeTab === "exam" && <ExamGenerator />}\n          {activeTab === "pdf2word" && <PdfToWord />}');
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("App.tsx patched");
}
