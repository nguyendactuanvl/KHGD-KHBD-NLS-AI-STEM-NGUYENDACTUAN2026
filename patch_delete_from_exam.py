import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

target = """                          <span className="text-xs text-emerald-600 font-normal mt-1 shrink-0">[{q.level}]</span>
                          <button onClick={() => saveToBank(q)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 shrink-0 no-print" title="Lưu vào Ngân hàng CH">+ Lưu NH</button>
                        </div>"""

replacement = """                          <span className="text-xs text-emerald-600 font-normal mt-1 shrink-0">[{q.level}]</span>
                          <button onClick={() => saveToBank(q)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 shrink-0 no-print" title="Lưu vào Ngân hàng CH">+ Lưu NH</button>
                          <button onClick={() => {
                            if (confirm("Xóa câu hỏi này khỏi đề?")) {
                               const updated = questions.filter(item => item.id !== q.id);
                               setQuestions(updated);
                            }
                          }} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 shrink-0 no-print" title="Xóa khỏi đề">Xóa</button>
                        </div>"""

code = code.replace(target, replacement)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched delete from exam")
