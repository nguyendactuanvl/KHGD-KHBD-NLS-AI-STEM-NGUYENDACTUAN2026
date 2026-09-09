import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

target = """                      <button onClick={() => deleteFromBank(q.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md" title="Xóa khỏi ngân hàng">
                        <Trash2 className="w-4 h-4" />
                      </button>"""

replacement = """                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => {
                          const newQ = { ...q, id: Date.now() };
                          setQuestions([...questions, newQ]);
                          alert("Đã thêm câu hỏi vào Đề gốc!");
                        }} className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md text-xs font-medium border border-blue-200 flex items-center gap-1" title="Thêm vào Đề gốc">
                          <Plus className="w-3 h-3" /> Thêm vào đề
                        </button>
                        <button onClick={() => deleteFromBank(q.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md border border-red-200" title="Xóa khỏi ngân hàng">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>"""

code = code.replace(target, replacement)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched add to exam")
