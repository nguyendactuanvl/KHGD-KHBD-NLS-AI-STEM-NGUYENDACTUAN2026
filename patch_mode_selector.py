import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

target_sgk = """                {/* 2. SGK / HỌC LIỆU */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span> SGK / HỌC LIỆU CHO AI
                  </h3>
                  <div className="w-full px-4 py-3 border border-slate-300 rounded-lg h-24 flex items-center justify-center bg-slate-50 border-dashed relative hover:bg-slate-100 transition-colors cursor-pointer mb-2">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.docx,.doc" />
                    <div className="text-center">
                      <span className="text-sm text-slate-500 font-medium">{matrixFile ? matrixFile.name : "+ Chọn SGK / học liệu"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">PDF, JPG, PNG, WEBP. Tối đa 50MB.</p>
                </div>"""

replacement_sgk = """                {/* 2. TÀI LIỆU GỐC & CHẾ ĐỘ TẠO */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span> TÀI LIỆU GỐC & CHẾ ĐỘ TẠO
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chế độ tạo đề:</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 flex-1 border-slate-200">
                        <input type="radio" name="generateMode" value="auto" checked={generateMode === "auto"} onChange={() => setGenerateMode("auto")} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-sm font-medium text-slate-700">Tạo tự động (Dựa vào AI)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 flex-1 border-slate-200">
                        <input type="radio" name="generateMode" value="from_matrix_file" checked={generateMode === "from_matrix_file"} onChange={() => setGenerateMode("from_matrix_file")} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-sm font-medium text-slate-700">Bám sát Ma trận đính kèm</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">File đính kèm (SGK / Ma trận / Học liệu):</label>
                    <div className={`w-full px-4 py-3 border rounded-lg h-24 flex items-center justify-center bg-slate-50 border-dashed relative hover:bg-slate-100 transition-colors cursor-pointer mb-2 ${generateMode === 'from_matrix_file' && !matrixFile ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}>
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.docx,.doc" />
                      <div className="text-center">
                        <span className="text-sm font-medium text-slate-600">{matrixFile ? matrixFile.name : "+ Chọn File đính kèm"}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">Hỗ trợ PDF, Word, Excel, Ảnh (JPG, PNG). Tối đa 50MB.</p>
                  </div>
                </div>"""

code = code.replace(target_sgk, replacement_sgk)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched sgk section")
