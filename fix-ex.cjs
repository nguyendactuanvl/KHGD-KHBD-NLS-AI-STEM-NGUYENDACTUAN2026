const fs = require('fs');
let code = fs.readFileSync('src/pages/ExerciseSolver.tsx', 'utf-8');

const brokenPart = `<div className="flex gap-2">
                  <button 
                    onClick={() => handleExportWord(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    <Download className="w-4 h-4" /> Word
                  </button>
                  <button 
                    onClick={() => handleExportWord(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                    title="Giữ nguyên mã LaTeX để dùng MathType"
                  >
                    LaTeX
                  </button>
                </div>`;

const fixedPart = `<button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Chọn File
                  </button>
                </>
              ) : (
                <div className="text-center w-full">
                  <div className="bg-emerald-100 p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-700 mb-2 truncate px-4">{selectedFile.name}</h3>
                  <p className="text-slate-500 mb-6 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  <div className="flex justify-center gap-3">
                    <button 
                      className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    >
                      <X className="w-4 h-4" /> Hủy
                    </button>
                    <button 
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
                      onClick={(e) => { e.stopPropagation(); handleSolveFromImage(); }}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Giải Bài Tập
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-rose-50 text-rose-700 rounded-lg text-sm text-center border border-rose-200">
                {error}
              </div>
            )}
          </div>
        )}

        {solution && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Lời giải chi tiết
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={handleSaveToLibrary}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                  Lưu thư viện
                </button>
                <button 
                  onClick={handleGenerateSimilar}
                  disabled={isGeneratingSimilar}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm font-medium"
                >
                  {isGeneratingSimilar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  Tạo bài tương tự
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExportWord(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    <Download className="w-4 h-4" /> Word
                  </button>
                  <button 
                    onClick={() => handleExportWord(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                    title="Giữ nguyên mã LaTeX để dùng MathType"
                  >
                    LaTeX
                  </button>
                </div>`;

code = code.replace(brokenPart, fixedPart);
fs.writeFileSync('src/pages/ExerciseSolver.tsx', code);
console.log("Fixed ExerciseSolver.tsx layout");
