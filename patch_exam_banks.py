import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

# Add activeTab === 'banks'
bank_ui = """
          {activeTab === "banks" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" /> Ngân Hàng Câu Hỏi ({bankQuestions.length})
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input type="text" placeholder="Lọc theo nội dung/chủ đề..." value={bankFilterTopic} onChange={e => setBankFilterTopic(e.target.value)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                  <select value={bankFilterLevel} onChange={e => setBankFilterLevel(e.target.value)} className="w-full sm:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">Tất cả mức độ</option>
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {bankQuestions.filter(q => 
                    (bankFilterTopic === "" || (q.topic && q.topic.toLowerCase().includes(bankFilterTopic.toLowerCase())) || (q.subtopic && q.subtopic.toLowerCase().includes(bankFilterTopic.toLowerCase())) || q.content.toLowerCase().includes(bankFilterTopic.toLowerCase())) &&
                    (bankFilterLevel === "" || (q.level && q.level.toLowerCase().includes(bankFilterLevel.toLowerCase())))
                  ).map((q, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg relative hover:border-emerald-300 transition">
                      <button onClick={() => deleteFromBank(q.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md" title="Xóa khỏi ngân hàng">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">{q.topic || 'Chung'}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-200">{q.subtopic || 'Chung'}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium border border-emerald-200">{q.level || 'Nhận biết'}</span>
                      </div>
                      <div className="font-medium text-slate-800 mb-3 markdown-body"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.content}</Markdown></div>
                      
                      {q.type === 'mc' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`flex items-start gap-1 p-1 rounded-md ${oIdx === q.correctOptionIndex ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                              <span className="shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                              <div className="markdown-body inline-markdown flex-1"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</Markdown></div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {q.type !== 'mc' && q.correctAnswer && (
                        <div className="mt-2 text-emerald-700 font-medium text-sm">
                          Đáp án: <span className="markdown-body inline-markdown"><Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.correctAnswer}</Markdown></span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {bankQuestions.length === 0 && (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                      Ngân hàng câu hỏi đang trống. Vui lòng tạo đề và lưu câu hỏi vào ngân hàng.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

code = code.replace("""          )}
        </div>
      </div>
    </div>
  );
}""", bank_ui)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched banks tab")
