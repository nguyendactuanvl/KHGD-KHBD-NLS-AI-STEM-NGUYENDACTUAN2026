const fs = require('fs');
let code = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf-8');

// 1. Add state for isGeneratingSimilar
if (!code.includes('isGeneratingSimilar')) {
  code = code.replace(
    'const [isUploading, setIsUploading] = useState(false);',
    'const [isUploading, setIsUploading] = useState(false);\n  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);'
  );
}

// 2. Add handleGenerateSimilar function
if (!code.includes('handleGenerateSimilar')) {
  const handleSolvePos = code.indexOf('const handleSolve = async () => {');
  
  const generateSimilarFunc = `
  const handleGenerateSimilar = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file bài tập trước.');
      return;
    }

    setIsGeneratingSimilar(true);
    setError(null);
    setSolution('');

    try {
      let fileData = '';
      let mimeType = selectedFile.type;

      if (selectedFile.name.endsWith('.docx')) {
        const text = await processDocx(selectedFile);
        fileData = btoa(unescape(encodeURIComponent(text)));
        mimeType = 'text/plain';
      } else {
        fileData = await fileToBase64(selectedFile);
      }

      const response = await fetch('/api/generate-similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{ data: fileData, type: mimeType }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate similar exercise');
      
      setSolution(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã xảy ra lỗi khi tạo bài tập tương tự. Vui lòng thử lại.');
    } finally {
      setIsGeneratingSimilar(false);
    }
  };
  
`;
  
  code = code.substring(0, handleSolvePos) + generateSimilarFunc + code.substring(handleSolvePos);
}

// 3. Add Copy icon to lucide-react imports if not there
if (!code.includes('Copy,')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { Copy, $1 } from 'lucide-react';");
}

// 4. Update the Buttons UI
const buttonUI = `
                    <button 
                      className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); handleSolve(); }}
                      disabled={isUploading || isGeneratingSimilar}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Bắt đầu giải
                    </button>
                    <button 
                      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); handleGenerateSimilar(); }}
                      disabled={isUploading || isGeneratingSimilar}
                    >
                      {isGeneratingSimilar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                      Tạo bài tương tự
                    </button>
`;

// Replace the single button with dual buttons
const oldButtonStart = code.indexOf('<button \n                      className="px-6 py-2 bg-emerald-600');
const oldButtonEndStr = 'Bắt đầu giải\n                    </button>';
const oldButtonEnd = code.indexOf(oldButtonEndStr) + oldButtonEndStr.length;

if (oldButtonStart !== -1 && oldButtonEnd !== -1 && !code.includes('Tạo bài tương tự')) {
  code = code.substring(0, oldButtonStart) + buttonUI + code.substring(oldButtonEnd);
}

fs.writeFileSync('src/pages/ExerciseSolver.tsx', code);
console.log("Updated ExerciseSolver.tsx with similar exercises button");
