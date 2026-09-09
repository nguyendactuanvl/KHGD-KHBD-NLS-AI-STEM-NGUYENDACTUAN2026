import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

replacement = """          {activeTab === "matrix" && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 space-y-6 w-full">
              
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100 gap-4">
                   <div className="flex-1">
                      <label className="block text-xs font-medium text-blue-800 mb-1">Mở cấu hình ma trận đã lưu</label>
                      <div className="flex gap-2">
                         <select onChange={e => loadConfig(e.target.value)} defaultValue="" className="flex-1 px-3 py-2 border border-blue-200 rounded-md text-sm bg-white focus:ring-blue-500">
                            <option value="" disabled>-- Chọn cấu hình đã lưu --</option>
                            {savedConfigs.map(c => (
                               <option key={c.id} value={c.id}>{c.name} ({new Date(c.timestamp).toLocaleDateString()})</option>
                            ))}
                         </select>
                         <button onClick={() => {
                            const sel = document.querySelector('select') as HTMLSelectElement;
                            if(sel && sel.value) deleteConfig(sel.value);
                         }} className="px-3 py-2 bg-red-50 text-red-600 rounded-md border border-red-200 hover:bg-red-100 transition" title="Xóa cấu hình đang chọn"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <button onClick={saveCurrentConfig} className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition text-sm font-medium whitespace-nowrap">
                      + Lưu cấu hình hiện tại
                   </button>
                </div>

                {/* 1. THÔNG TIN ĐỀ */}"""

code = code.replace("          {activeTab === \"matrix\" && (\n            <div className=\"flex flex-col lg:flex-row gap-6 items-start\">\n              <div className=\"flex-1 space-y-6 w-full\">\n                {/* 1. THÔNG TIN ĐỀ */}", replacement)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched ui")
