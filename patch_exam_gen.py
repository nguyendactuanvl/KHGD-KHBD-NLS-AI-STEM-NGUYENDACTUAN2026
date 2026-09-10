import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

# Replace handleExportWord
old_func = re.search(r'const handleExportWord = \(contentId: string, code: string\) => \{.*?document\.body\.removeChild\(link\);\n  \};', code, re.DOTALL)
if old_func:
    new_func = """const handleExportWord = (contentId: string, code: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;
    exportHtmlToWord(printContent, `De_kiem_tra_Ma_${code}.doc`);
  };"""
    code = code[:old_func.start()] + new_func + code[old_func.end():]

# Replace inline export for matrix table
old_inline = re.search(r'onClick=\{\(\) => \{\s*const html = document\.getElementById\(\'matrix-table-wrap\'\)\?\.innerHTML;.*?document\.body\.removeChild\(link\);\s*\}\}', code, re.DOTALL)
if old_inline:
    new_inline = """onClick={() => {
                                const wrap = document.getElementById('matrix-table-wrap');
                                if (!wrap) return;
                                exportHtmlToWord(wrap, 'Ma_Tran_De_Kiem_Tra.doc');
                            }}"""
    code = code[:old_inline.start()] + new_inline + code[old_inline.end():]

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("Patched ExamGenerator.tsx!")
