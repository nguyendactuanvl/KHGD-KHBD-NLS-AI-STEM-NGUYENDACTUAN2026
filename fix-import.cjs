const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf-8');

if (!code.includes("import { saveToHistory }")) {
    code = code.replace("import rehypeRaw from \"rehype-raw\";", "import rehypeRaw from \"rehype-raw\";\nimport { saveToHistory } from '../lib/history';");
    fs.writeFileSync('src/pages/LessonPlan.tsx', code);
    console.log("Success with exact match");
} else {
    console.log("Already imported.");
}
