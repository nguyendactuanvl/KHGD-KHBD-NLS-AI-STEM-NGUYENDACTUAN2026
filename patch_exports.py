import re
import os

FILES = [
    "src/pages/ExamGenerator.tsx",
    "src/pages/LessonPlan.tsx",
    "src/pages/ExerciseSolver.tsx",
    "src/pages/PdfToWord.tsx",
    "src/pages/EducationalPlan.tsx",
    "src/pages/HistoryPage.tsx",
    "src/pages/HomeroomManagement.tsx"
]

for filepath in FILES:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r") as f:
        code = f.read()

    # Add import if missing
    if "import { exportHtmlToWord }" not in code:
        code = code.replace("import React,", "import { exportHtmlToWord } from '../lib/exportUtils';\nimport React,")
        if "import React " in code and "import { exportHtmlToWord }" not in code:
            code = code.replace("import React ", "import { exportHtmlToWord } from '../lib/exportUtils';\nimport React ")
        elif "import { useState" in code and "import { exportHtmlToWord }" not in code:
             code = code.replace("import { useState", "import { exportHtmlToWord } from '../lib/exportUtils';\nimport { useState")

    # The export logic varies wildly across files. 
    # ExamGenerator.tsx: 
    #   const handleExportWord = (contentId: string, code: string) => { ... }
    #   and inline `onClick={() => { const html = ... }}`
    
    # It's better to just write specific replacements for ExamGenerator, PdfToWord, ExerciseSolver, LessonPlan, EducationalPlan, HistoryPage, HomeroomManagement

    with open(filepath, "w") as f:
        f.write(code)

print("Imports added!")
