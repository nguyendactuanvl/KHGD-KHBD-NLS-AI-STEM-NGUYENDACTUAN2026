const fs = require('fs');
let content = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf8');

const targetDropdown = `      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Trợ lý Giải Bài Tập Thông Minh</h2>`;
const replacementDropdown = `      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Trợ lý Giải Bài Tập Thông Minh</h2>
        
        {historyItems.length > 0 && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-indigo-600" /> Lịch sử đã giải
            </label>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) => {
                if (e.target.value) {
                  const item = historyItems.find(h => h.id === e.target.value);
                  if (item) {
                    setSolution(item.content);
                  }
                }
              }}
            >
              <option value="">-- Chọn bài tập đã giải trong lịch sử --</option>
              {historyItems.map(item => (
                <option key={item.id} value={item.id}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')} - {item.lessonName}
                </option>
              ))}
            </select>
          </div>
        )}`;

content = content.replace(targetDropdown, replacementDropdown);
fs.writeFileSync('src/pages/ExerciseSolver.tsx', content);
