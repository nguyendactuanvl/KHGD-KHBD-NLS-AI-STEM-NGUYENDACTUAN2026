import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

# Add preset functions
preset_funcs = """  const applyPresetBGD3Phan = () => {
    setQEnabled({ mc: true, tf: true, sa: true, essay: false });
    setQCounts({ mc: 12, tf: 4, sa: 6, essay: 0 });
    setQPoints({ mc: 0.25, tf: 1, sa: 0.5, essay: 2 });
  };

  const applyPreset4Phan = () => {
    setQEnabled({ mc: true, tf: true, sa: true, essay: true });
    setQCounts({ mc: 12, tf: 2, sa: 4, essay: 3 });
    setQPoints({ mc: 0.25, tf: 1, sa: 0.5, essay: 1 });
  };

  const handleGenerate = async () => {"""

code = code.replace("  const handleGenerate = async () => {", preset_funcs)

# Add UI Buttons
ui_search = """                {/* 3. CẤU TRÚC ĐỀ */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span> CẤU TRÚC ĐỀ
                  </h3>
                  <div className="space-y-3">"""

ui_replace = """                {/* 3. CẤU TRÚC ĐỀ */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span> CẤU TRÚC ĐỀ
                    </div>
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                     <span className="text-xs font-medium text-slate-500 flex items-center mr-1">Gợi ý nhanh:</span>
                     <button onClick={applyPresetBGD3Phan} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm hover:bg-blue-100 transition-colors">Chuẩn BGD 3 phần (12 TN, 4 ĐS, 6 TLN)</button>
                     <button onClick={applyPreset4Phan} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-sm hover:bg-emerald-100 transition-colors">Đề 4 phần (có Tự luận)</button>
                  </div>
                  <div className="space-y-3">"""

code = code.replace(ui_search, ui_replace)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("ExamGenerator presets patched")
