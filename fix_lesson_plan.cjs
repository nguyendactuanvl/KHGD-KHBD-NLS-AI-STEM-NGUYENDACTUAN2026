const fs = require('fs');
let content = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf8');

content = content.replace(/await fetch\(endpoint/g, "await apiFetch(endpoint");
if (!content.includes("import { apiFetch }")) {
  content = "import { apiFetch } from '../lib/apiFetch';\n" + content;
}
fs.writeFileSync('src/pages/LessonPlan.tsx', content);
