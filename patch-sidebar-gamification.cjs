const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

if (!code.includes('Thi đua & Gọi tên')) {
  // Add Trophy to lucide imports if not there
  if (!code.includes('Trophy')) {
    code = code.replace('import {  BookOpen', 'import { Trophy, BookOpen');
  }

  const navItemsNew = `
    { id: "gamification", label: "Thi đua & Gọi tên", icon: Trophy },
    { id: "classmap", label: "Sơ đồ lớp", icon: Users },
`;
  code = code.replace('{ id: "classmap", label: "Sơ đồ lớp", icon: Users },', navItemsNew.trim());
  
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log('Sidebar updated');
}
