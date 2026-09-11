import re
with open('src/pages/ExamGenerator.tsx', 'r', encoding='utf-8') as f:
    s = f.read()

s = re.sub(
    r'</label>\s*</div>\s*<p className="text-xs text-slate-400">',
    '</label>\n                    )}\n                    <p className="text-xs text-slate-400 mt-2">',
    s
)
with open('src/pages/ExamGenerator.tsx', 'w', encoding='utf-8') as f:
    f.write(s)
