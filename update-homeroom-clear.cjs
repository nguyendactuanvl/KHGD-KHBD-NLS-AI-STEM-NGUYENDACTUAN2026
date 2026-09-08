const fs = require('fs');
let code = fs.readFileSync('src/pages/HomeroomManagement.tsx', 'utf8');

// 1. Add clearAllStudents function
const clearFunc = `
  const clearAllStudents = () => {
    if (confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách học sinh và điểm thi đua của lớp này không? Hành động này không thể hoàn tác.")) {
      saveStudents([]);
      saveCompetitionScores({});
    }
  };

  const removeStudent = (id: string) => {
`;
code = code.replace('const removeStudent = (id: string) => {', clearFunc);

// 2. Add the button to the UI
const addBtnStr = `<button onClick={addStudent} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium">
                <Plus className="w-4 h-4" /> Thêm HS
              </button>`;
const newBtnStr = `<button onClick={addStudent} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium shadow-sm transition-colors">
                <Plus className="w-4 h-4" /> Thêm HS
              </button>
              <button onClick={clearAllStudents} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 text-sm font-medium transition-colors" title="Xóa toàn bộ danh sách">
                <Trash2 className="w-4 h-4" /> Xóa danh sách
              </button>`;
code = code.replace(addBtnStr, newBtnStr);

fs.writeFileSync('src/pages/HomeroomManagement.tsx', code);
console.log('Added clearAllStudents to HomeroomManagement');
