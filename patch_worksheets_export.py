import re

with open("src/pages/Worksheets.tsx", "r") as f:
    code = f.read()

# Make sure we import exportHtmlToWord
if "import { exportHtmlToWord }" not in code:
    code = code.replace("import React,", "import { exportHtmlToWord } from '../lib/exportUtils';\nimport React,")

# Replace handleExportWord
old_func = re.search(r'const handleExportWord = \(\) => \{.*?(?:return\s*\(\s*<div)|\s*return \(', code, re.DOTALL)
if old_func:
    start_idx = old_func.start()
    end_idx = old_func.end() - len("  return (")
    
    new_func = """const handleExportWord = () => {
    if (viewMode === 'edit') {
      if (window.confirm("Bạn đang ở chế độ chỉnh sửa (hiển thị mã Markdown). Bạn có muốn chuyển sang chế độ Xem trước để xuất file đẹp hơn không?")) {
        setViewMode('preview');
        setTimeout(() => {
          if (exportRef.current) {
            exportHtmlToWord(exportRef.current, `PhieuHocTap_${customLessonName.replace(/\s+/g, '_')}.doc`);
          }
        }, 500);
      } else {
        alert("Vui lòng chuyển sang chế độ 'Xem trước' (con mắt) trước khi tải xuống.");
      }
      return;
    }

    if (exportRef.current) {
      exportHtmlToWord(exportRef.current, `PhieuHocTap_${customLessonName.replace(/\s+/g, '_')}.doc`);
    }
  };

"""
    code = code[:start_idx] + new_func + "  return (" + code[end_idx + len("  return ("):]

with open("src/pages/Worksheets.tsx", "w") as f:
    f.write(code)
