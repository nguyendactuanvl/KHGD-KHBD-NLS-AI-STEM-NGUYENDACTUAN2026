const fs = require('fs');
let content = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

// The line before "</div>" should have ")}". Let's just fix the whole block.
content = content.replace(
`                    {generateMode === 'from_matrix_file' && (
                       <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                          <input type="checkbox" checked={autoDetectStructure} onChange={e => setAutoDetectStructure(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                          Tự động làm đúng số câu theo ma trận tải lên (Bỏ qua cấu trúc bên dưới)
                       </label>
                    </div>
                    <p className="text-xs text-slate-400">Hỗ trợ PDF, Word, Excel, Ảnh (JPG, PNG). Tối đa 50MB.</p>
                  </div>`,
`                    {generateMode === 'from_matrix_file' && (
                       <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                          <input type="checkbox" checked={autoDetectStructure} onChange={e => setAutoDetectStructure(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                          Tự động làm đúng số câu theo ma trận tải lên (Bỏ qua cấu trúc bên dưới)
                       </label>
                    )}
                    <p className="text-xs text-slate-400 mt-2">Hỗ trợ PDF, Word, Excel, Ảnh (JPG, PNG). Tối đa 50MB.</p>
                  </div>`
);
fs.writeFileSync('src/pages/ExamGenerator.tsx', content);
