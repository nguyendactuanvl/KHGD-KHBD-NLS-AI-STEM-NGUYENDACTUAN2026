import re

with open('src/pages/ExamGenerator.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add autoDetectStructure state
state_code = 'const [generateMode, setGenerateMode] = useState<"auto" | "from_matrix_file">("auto");\n  const [autoDetectStructure, setAutoDetectStructure] = useState(false);'
content = content.replace('const [generateMode, setGenerateMode] = useState<"auto" | "from_matrix_file">("auto");', state_code)

# Send to server
body_code = """body: JSON.stringify({ 
          subject, grade, duration, examType, matrix, customPrompt: finalPrompt,
          qCounts: activeQCounts,
          matrixFile: matrixBase64,
          selectedTopics,
          autoDetectStructure
        })"""
content = re.sub(r'body: JSON\.stringify\(\{.*?\selectedTopics\n\s*\}\)', body_code, content, flags=re.DOTALL)


# Add UI for auto detect checkbox when generateMode === "from_matrix_file"
ui_checkbox = """
                    <div className={`w-full px-4 py-3 border rounded-lg h-24 flex items-center justify-center bg-slate-50 border-dashed relative hover:bg-slate-100 transition-colors cursor-pointer mb-2 ${generateMode === 'from_matrix_file' && !matrixFile ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}>
                      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <UploadCloud className="w-6 h-6 text-slate-400" />
                        <span className="text-sm font-medium">{matrixFile ? matrixFile.name : "Tải lên tệp ảnh/PDF ma trận"}</span>
                      </div>
                    </div>
                    {generateMode === 'from_matrix_file' && (
                       <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                          <input type="checkbox" checked={autoDetectStructure} onChange={e => setAutoDetectStructure(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                          Tự động làm đúng số câu theo ma trận tải lên (Bỏ qua cấu trúc bên dưới)
                       </label>
                    )}
"""
content = re.sub(
    r'<div className=\{`w-full px-4 py-3 border rounded-lg h-24 flex items-center justify-center bg-slate-50 border-dashed.*?</div\>',
    ui_checkbox,
    content,
    flags=re.DOTALL
)

with open('src/pages/ExamGenerator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

