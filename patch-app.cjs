const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('ClassMap')) {
  const imports = `import { ClassMap } from './pages/ClassMap';\nimport { HomeroomManagement } from './pages/HomeroomManagement';\nimport { WeeklyTimetable } from './pages/WeeklyTimetable';\n`;
  code = code.replace('import { StudentExamView } from \'./pages/StudentExamView\';', `import { StudentExamView } from './pages/StudentExamView';\n${imports}`);

  const tabs = `          {activeTab === "classmap" && <ClassMap />}
          {activeTab === "homeroom" && <HomeroomManagement />}
          {activeTab === "timetable" && <WeeklyTimetable />}`;
          
  code = code.replace('{activeTab === "exam" && <ExamGenerator />}', `${tabs}\n          {activeTab === "exam" && <ExamGenerator />}`);
  
  // Let's set default active tab to classmap to test it
  code = code.replace('useState("khgd");', 'useState("classmap");');
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('App updated');
}
