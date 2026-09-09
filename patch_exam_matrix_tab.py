import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

matrix_render_code = """
          {activeTab === "exam" && (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Chưa có đề gốc. Vui lòng tạo đề ở bước 1.</div>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-slate-800">{examName}</h3>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Số mã đề:</label>
                        <input type="number" min="1" max="24" value={numCodes} onChange={e => setNumCodes(Number(e.target.value))} className="w-16 px-2 py-1 border border-slate-300 rounded-md" />
                      </div>
                      <button onClick={handleShuffle} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Shuffle className="w-4 h-4" /> Trộn Đề
                      </button>
                    </div>
                  </div>
                  
                  {/* MA TRẬN */}
                  {outputConfig.matrix && (
                    <div className="border border-slate-200 rounded-lg p-6 space-y-6 bg-white overflow-x-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-center flex-1">MA TRẬN ĐỀ KIỂM TRA</h2>
                        <button onClick={() => window.print()} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 flex items-center gap-2 text-sm border border-blue-200">
                          <Printer className="w-4 h-4" /> Xuất Ma Trận
                        </button>
                      </div>
                      <table className="w-full border-collapse border border-slate-300 text-sm min-w-[800px]">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 text-center align-middle" rowSpan={2}>TT</th>
                            <th className="border border-slate-300 p-2 text-center align-middle" rowSpan={2}>Chủ đề/Chương</th>
                            <th className="border border-slate-300 p-2 text-center align-middle" rowSpan={2}>Nội dung/đơn vị kiến thức</th>
                            <th className="border border-slate-300 p-2 text-center" colSpan={3}>Mức độ đánh giá</th>
                            <th className="border border-slate-300 p-2 text-center align-middle" rowSpan={2}>Tổng số câu</th>
                            <th className="border border-slate-300 p-2 text-center align-middle" rowSpan={2}>Tỉ lệ %</th>
                          </tr>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 text-center">Nhận biết</th>
                            <th className="border border-slate-300 p-2 text-center">Thông hiểu</th>
                            <th className="border border-slate-300 p-2 text-center">Vận dụng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(new Set(questions.map(q => q.topic))).map((topic, tIdx) => {
                             const topicQs = questions.filter(q => q.topic === topic);
                             const subtopics = Array.from(new Set(topicQs.map(q => q.subtopic)));
                             return subtopics.map((sub, sIdx) => {
                                const subQs = topicQs.filter(q => q.subtopic === sub);
                                const nb = subQs.filter(q => q.level.toLowerCase().includes("nhận biết") || q.level.toLowerCase().includes("biết")).length;
                                const th = subQs.filter(q => q.level.toLowerCase().includes("thông hiểu") || q.level.toLowerCase().includes("hiểu")).length;
                                const vd = subQs.filter(q => q.level.toLowerCase().includes("vận dụng")).length;
                                const total = subQs.length;
                                const percent = Math.round((total / totalQuestionsCalc) * 100) || 0;
                                return (
                                  <tr key={`${tIdx}-${sIdx}`}>
                                    {sIdx === 0 && <td className="border border-slate-300 p-2 text-center" rowSpan={subtopics.length}>{tIdx + 1}</td>}
                                    {sIdx === 0 && <td className="border border-slate-300 p-2 font-medium" rowSpan={subtopics.length}>{topic}</td>}
                                    <td className="border border-slate-300 p-2">{sub}</td>
                                    <td className="border border-slate-300 p-2 text-center">{nb || ""}</td>
                                    <td className="border border-slate-300 p-2 text-center">{th || ""}</td>
                                    <td className="border border-slate-300 p-2 text-center">{vd || ""}</td>
                                    <td className="border border-slate-300 p-2 text-center font-medium">{total}</td>
                                    <td className="border border-slate-300 p-2 text-center">{percent}%</td>
                                  </tr>
                                );
                             });
                          })}
                          <tr className="bg-slate-50 font-bold">
                            <td className="border border-slate-300 p-2 text-center" colSpan={3}>Tổng cộng</td>
                            <td className="border border-slate-300 p-2 text-center">{questions.filter(q => q.level.toLowerCase().includes("nhận biết") || q.level.toLowerCase().includes("biết")).length}</td>
                            <td className="border border-slate-300 p-2 text-center">{questions.filter(q => q.level.toLowerCase().includes("thông hiểu") || q.level.toLowerCase().includes("hiểu")).length}</td>
                            <td className="border border-slate-300 p-2 text-center">{questions.filter(q => q.level.toLowerCase().includes("vận dụng")).length}</td>
                            <td className="border border-slate-300 p-2 text-center">{questions.length}</td>
                            <td className="border border-slate-300 p-2 text-center">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-lg p-6 space-y-6 bg-white" id="original-exam">
"""

code = code.replace("""          {activeTab === "exam" && (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Chưa có đề gốc. Vui lòng tạo đề ở bước 1.</div>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-slate-800">{examName}</h3>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Số mã đề:</label>
                        <input type="number" min="1" max="24" value={numCodes} onChange={e => setNumCodes(Number(e.target.value))} className="w-16 px-2 py-1 border border-slate-300 rounded-md" />
                      </div>
                      <button onClick={handleShuffle} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                        <Shuffle className="w-4 h-4" /> Trộn Đề
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-6 space-y-6 bg-white" id="original-exam">""", matrix_render_code)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched exam matrix tab")
