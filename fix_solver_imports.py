with open("src/pages/ExerciseSolver.tsx", "r") as f:
    code = f.read()

replacement = """import { exportHtmlToWord } from '../lib/exportUtils';
import React, { useState, useRef, useMemo } from 'react';
import { Copy, Save, Upload, X, Sparkles, Loader2, Download, Presentation, ChevronLeft, ChevronRight, Maximize2, FileText, BookmarkPlus, Camera, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react';
"""

code = code.replace("import { Copy, Save, Upload, X, Sparkles, Loader2, Download, Presentation, ChevronLeft, ChevronRight, Maximize2, FileText, BookmarkPlus, Camera, Image as ImageIcon, Send, ArrowLeft } from 'lucide-react';", replacement)

with open("src/pages/ExerciseSolver.tsx", "w") as f:
    f.write(code)
