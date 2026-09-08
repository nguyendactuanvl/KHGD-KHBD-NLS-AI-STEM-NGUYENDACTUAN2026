const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('Gamification')) {
  const imports = `import { Gamification } from './pages/Gamification';\n`;
  code = code.replace("import { WeeklyTimetable } from './pages/WeeklyTimetable';", "import { WeeklyTimetable } from './pages/WeeklyTimetable';\n" + imports);

  const tabs = `          {activeTab === "gamification" && <Gamification />}`;
          
  code = code.replace('{activeTab === "classmap" && <ClassMap />}', tabs + '\n          {activeTab === "classmap" && <ClassMap />}');
  
  // set default
  code = code.replace('useState("classmap");', 'useState("gamification");');
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('App updated');
}
