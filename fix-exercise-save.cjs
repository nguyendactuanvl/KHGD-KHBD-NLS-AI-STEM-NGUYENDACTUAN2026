const fs = require('fs');
let code = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf-8');

if (!code.includes('saveToHistory')) {
  // 1. Add import
  const lastImport = code.lastIndexOf('import ');
  const nextLine = code.indexOf('\n', lastImport);
  code = code.substring(0, nextLine + 1) + "import { saveToHistory } from '../lib/history';\n" + code.substring(nextLine + 1);
  
  // 2. Add Save to lucide-react imports if not there
  if (!code.includes('Save,')) {
    code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { Save, $1 } from 'lucide-react';");
  }
  
  // 3. Add handleSave
  const insertHandleSavePos = code.indexOf('const handleExportPDF = () => {');
  const handleSaveStr = `
  const handleSave = () => {
    if (!solution) return;
    saveToHistory({
      type: "GBT",
      grade: 0,
      subject: "Chung",
      lessonName: selectedFile ? "Giải bài tập: " + selectedFile.name : "Giải bài tập",
      content: solution
    });
    alert("Đã lưu vào thư viện lịch sử thành công!");
  };

  `;
  code = code.substring(0, insertHandleSavePos) + handleSaveStr + code.substring(insertHandleSavePos);
  
  // 4. Add the save button to UI
  const insertButtonPos = code.indexOf('<button \n                  onClick={() => setSolution(\'\')}');
  const saveButtonStr = `<button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu thư viện
                </button>
                `;
  
  code = code.substring(0, insertButtonPos) + saveButtonStr + code.substring(insertButtonPos);
  
  fs.writeFileSync('src/pages/ExerciseSolver.tsx', code);
  console.log("Updated ExerciseSolver.tsx");
}
