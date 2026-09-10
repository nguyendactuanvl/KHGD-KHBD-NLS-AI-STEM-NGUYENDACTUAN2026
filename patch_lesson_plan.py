import re

with open("src/pages/LessonPlan.tsx", "r") as f:
    code = f.read()

old_func = re.search(r'const handleExportWord = \(\) => \{.*?(?:return\s*\(\s*<div)|\s*return \(', code, re.DOTALL)
if old_func:
    start_idx = old_func.start()
    end_idx = old_func.end() - len("  return (")
    new_func = """const handleExportWord = () => {
    if (!suggestion || !exportRef.current) {
      if (isEditing) {
        alert("Vui lòng tắt chế độ chỉnh sửa (ấn biểu tượng Con mắt) để lưu tệp Word có định dạng đầy đủ.");
      }
      return;
    }
    exportHtmlToWord(exportRef.current, `GiaoAn_${lessonName.replace(/\s+/g, '_')}.doc`);
  };

"""
    code = code[:start_idx] + new_func + "  return (" + code[end_idx + len("  return ("):]

with open("src/pages/LessonPlan.tsx", "w") as f:
    f.write(code)

print("Patched LessonPlan!")
