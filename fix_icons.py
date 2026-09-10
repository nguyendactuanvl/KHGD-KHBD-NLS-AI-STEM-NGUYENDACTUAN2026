with open("src/pages/ExerciseSolver.tsx", "r") as f:
    code = f.read()

import_statement = "import { Copy, Save, Upload, X, Sparkles, Loader2, Download, Presentation, ChevronLeft, ChevronRight, Maximize2, FileText, BookmarkPlus, Camera, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react';"

import re
code = re.sub(r"import \{.*?\} from ['\"]lucide-react['\"];", import_statement, code, count=1, flags=re.DOTALL)

with open("src/pages/ExerciseSolver.tsx", "w") as f:
    f.write(code)
