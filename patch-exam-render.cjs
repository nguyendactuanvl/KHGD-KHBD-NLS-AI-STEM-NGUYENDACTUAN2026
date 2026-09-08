const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamGenerator.tsx', 'utf8');

const oldForm = `
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                  <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tổng số câu</label>
                  <input type="number" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cấu trúc Ma trận (Chủ đề, tỉ lệ %)</label>
                <textarea 
                  value={matrix} 
                  onChange={e => setMatrix(e.target.value)} 
                  placeholder="Ví dụ: 50% Đại số (Hệ phương trình), 50% Hình học (Đường tròn). Mức độ: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg h-24 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yêu cầu bổ sung (Tùy chọn)</label>
                <textarea 
                  value={customPrompt} 
                  onChange={e => setCustomPrompt(e.target.value)} 
                  placeholder="Ví dụ: Đề bám sát đề minh họa BGD..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg h-20 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
`;

const newForm = `
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                  <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian (phút)</label>
                  <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại bài thi</label>
                  <select value={examType} onChange={e => setExamType(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="15p">15 phút</option>
                    <option value="45p">1 tiết (45p)</option>
                    <option value="mid">Giữa kỳ</option>
                    <option value="final">Cuối kỳ</option>
                  </select>
                </div>
              </div>

              {subject.toLowerCase().includes("toán") && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 space-y-4">
                  <h3 className="font-semibold text-emerald-800">Cấu trúc đề Toán (Số câu)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Trắc nghiệm</label>
                      <input type="number" value={qCounts.mc} onChange={e => setQCounts({...qCounts, mc: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Đúng/Sai</label>
                      <input type="number" value={qCounts.tf} onChange={e => setQCounts({...qCounts, tf: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Trả lời ngắn</label>
                      <input type="number" value={qCounts.sa} onChange={e => setQCounts({...qCounts, sa: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Tự luận</label>
                      <input type="number" value={qCounts.essay} onChange={e => setQCounts({...qCounts, essay: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-emerald-200 rounded-md focus:ring-emerald-500 bg-white" />
                    </div>
                  </div>
                  
                  {availableTopics.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-emerald-800 mb-2">Chọn chủ đề từ Kế hoạch giáo dục (Tùy chọn)</label>
                      <div className="max-h-40 overflow-y-auto bg-white border border-emerald-200 rounded-lg p-2 space-y-1">
                        {availableTopics.map((topic, i) => (
                          <label key={i} className="flex items-start gap-2 p-1 hover:bg-emerald-50 rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="mt-1 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                              checked={selectedTopics.includes(topic)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedTopics([...selectedTopics, topic]);
                                else setSelectedTopics(selectedTopics.filter(t => t !== topic));
                              }}
                            />
                            <span className="text-sm text-slate-700">{topic}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!subject.toLowerCase().includes("toán") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tổng số câu (Trắc nghiệm)</label>
                  <input type="number" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhập Cấu trúc Ma trận (Thủ công)</label>
                  <textarea 
                    value={matrix} 
                    onChange={e => setMatrix(e.target.value)} 
                    placeholder="Ví dụ: 50% Đại số (Hệ phương trình), 50% Hình học (Đường tròn). Mức độ: 40% Nhận biết..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg h-24 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hoặc Tải lên file Ma trận (Ảnh, PDF, Word)</label>
                  <div className="w-full px-4 py-3 border border-slate-300 rounded-lg h-24 flex items-center justify-center bg-slate-50 border-dashed relative hover:bg-slate-100 transition-colors cursor-pointer">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.docx,.doc" />
                    <div className="text-center">
                      <span className="text-sm text-slate-500 font-medium">{matrixFile ? matrixFile.name : "Nhấn hoặc kéo thả file vào đây"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yêu cầu bổ sung (Tùy chọn)</label>
                <textarea 
                  value={customPrompt} 
                  onChange={e => setCustomPrompt(e.target.value)} 
                  placeholder="Ví dụ: Đề bám sát đề minh họa BGD..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg h-20 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
`;

code = code.replace(oldForm, newForm);
fs.writeFileSync('src/pages/ExamGenerator.tsx', code);
console.log('Exam form updated');
