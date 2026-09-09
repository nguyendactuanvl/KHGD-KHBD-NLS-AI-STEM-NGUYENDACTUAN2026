import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

target = """<div className="font-medium text-slate-800 mb-3 flex items-start gap-2"><span className="font-bold whitespace-nowrap mt-1">Câu {idx + 1}:</span> <div className="markdown-body flex-1"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{q.content}</Markdown></div> <span className="text-xs text-emerald-600 font-normal mt-1 shrink-0">[{q.level}]</span></div>"""

replacement = """<div className="font-medium text-slate-800 mb-3 flex items-start gap-2">
                          <span className="font-bold whitespace-nowrap mt-1">Câu {idx + 1}:</span> 
                          <div className="markdown-body flex-1"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} >{q.content}</Markdown></div> 
                          <span className="text-xs text-emerald-600 font-normal mt-1 shrink-0">[{q.level}]</span>
                          <button onClick={() => saveToBank(q)} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 shrink-0 no-print" title="Lưu vào Ngân hàng CH">+ Lưu NH</button>
                        </div>"""

code = code.replace(target, replacement)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched save to bank")
