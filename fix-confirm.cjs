const fs = require('fs');

// Fix Gamification.tsx
let gCode = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');

// Add state for confirm modal
if (!gCode.includes('isConfirmClearOpen')) {
  gCode = gCode.replace('const [isAiModalOpen', 'const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);\n  const [isAiModalOpen');
}

// Update clearAllStudents to just open the confirm modal
gCode = gCode.replace(
  /const clearAllStudents = \(\) => \{\s*if \(confirm\(.*?\) \{\s*saveStudents\(\[\]\);\s*saveScores\(scores\.filter\(s => !students\.some\(st => st\.id === s\.studentId\)\)\);\s*\}\s*\};/s,
  `const clearAllStudents = () => { setIsConfirmClearOpen(true); };
  const executeClearAllStudents = () => {
    saveStudents([]);
    saveScores(scores.filter(s => !students.some(st => st.id === s.studentId)));
    setIsConfirmClearOpen(false);
  };`
);

// Inject confirm modal at the bottom
const confirmModalJsx = `
      {/* Confirm Clear Modal */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Cảnh báo xóa dữ liệu</h3>
              <p className="text-slate-600 text-sm">
                Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách học sinh của lớp này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsConfirmClearOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
                Hủy bỏ
              </button>
              <button onClick={executeClearAllStudents} className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors">
                Xóa toàn bộ
              </button>
            </div>
          </div>
        </div>
      )}
`;
if (!gCode.includes('Confirm Clear Modal')) {
  const lastIndex = gCode.lastIndexOf('    </div>\n  );\n}');
  if (lastIndex !== -1) {
     gCode = gCode.substring(0, lastIndex) + confirmModalJsx + '\n' + gCode.substring(lastIndex);
  }
}
fs.writeFileSync('src/pages/Gamification.tsx', gCode);


// Fix HomeroomManagement.tsx
let hCode = fs.readFileSync('src/pages/HomeroomManagement.tsx', 'utf8');

// Add state for confirm modal
if (!hCode.includes('isConfirmClearOpen')) {
  hCode = hCode.replace('const [isExtracting', 'const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);\n  const [isExtracting');
}

// Update clearAllStudents to open confirm modal
hCode = hCode.replace(
  /const clearAllStudents = \(\) => \{\s*if \(confirm\(.*?\) \{\s*saveStudents\(\[\]\);\s*saveCompetitionScores\(\{\}\);\s*\}\s*\};/s,
  `const clearAllStudents = () => { setIsConfirmClearOpen(true); };
  const executeClearAllStudents = () => {
    saveStudents([]);
    saveCompetitionScores({});
    setIsConfirmClearOpen(false);
  };`
);

if (!hCode.includes('Confirm Clear Modal')) {
  const lastIndexH = hCode.lastIndexOf('    </div>\n  );\n}');
  if (lastIndexH !== -1) {
     hCode = hCode.substring(0, lastIndexH) + confirmModalJsx + '\n' + hCode.substring(lastIndexH);
  }
}
fs.writeFileSync('src/pages/HomeroomManagement.tsx', hCode);

console.log('Fixed Confirm Modals');
