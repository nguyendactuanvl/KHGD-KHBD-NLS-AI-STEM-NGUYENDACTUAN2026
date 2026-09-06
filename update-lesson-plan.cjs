const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf-8');

if (!code.includes("import { saveToHistory }")) {
    code = code.replace("import Markdown from 'react-markdown';", "import Markdown from 'react-markdown';\nimport { saveToHistory } from '../lib/history';");
}

const target = `      const data = await response.json();
      setSuggestion(data.result);`;

const replacement = `      const data = await response.json();
      setSuggestion(data.result);
      
      // Save to history
      saveToHistory({
        type: "KHBD",
        grade: activeTab === "system" && selectedLesson ? selectedLesson.grade : 0,
        subject: subject,
        lessonName: activeTab === "system" && selectedLesson ? selectedLesson.lesson : customLessonName,
        content: data.result
      });`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/LessonPlan.tsx', code);
    console.log("Success with exact match");
} else {
    console.log("Target not found.");
}
