const fs = require('fs');
let code = fs.readFileSync('src/pages/LessonPlan.tsx', 'utf-8');

if (!code.includes('import pptxgen from "pptxgenjs";')) {
    code = code.replace('import { Sparkles, Save, BookOpen, Download, AlertCircle, Upload, Edit3, Eye } from "lucide-react";', 'import { Sparkles, Save, BookOpen, Download, AlertCircle, Upload, Edit3, Eye, Presentation } from "lucide-react";\nimport pptxgen from "pptxgenjs";');
}

fs.writeFileSync('src/pages/LessonPlan.tsx', code);
console.log("Fixed imports in LessonPlan.tsx");
