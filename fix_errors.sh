#!/bin/bash
sed -i 's/exportHtmlToWord(exportRef.current, `GiaoAn_${lessonName.replace(\/\\s+\/g, '_')}.doc`);/exportHtmlToWord(exportRef.current, `GiaoAn_${(selectedLesson ? selectedLesson.lesson : customLessonName).replace(\/\\s+\/g, '_')}.doc`);/g' src/pages/LessonPlan.tsx

sed -i '/textbook: selectedTextbook?.name || "Kết nối tri thức với cuộc sống",/d' src/pages/LessonPlan.tsx

sed -i 's/viewMode === '"'"'edit'"'"'/isEditing/g' src/pages/Worksheets.tsx
sed -i 's/setViewMode('"'"'preview'"'"')/setIsEditing(false)/g' src/pages/Worksheets.tsx

sed -i 's/import { useState, useRef } from "react";/import { exportHtmlToWord } from "..\/lib\/exportUtils";\nimport { useState, useRef } from "react";/g' src/pages/Worksheets.tsx

