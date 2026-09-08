const fs = require('fs');
let code = fs.readFileSync('src/pages/HomeroomManagement.tsx', 'utf8');

// Update imports for icons
if (!code.includes('Download')) {
  code = code.replace('Edit3', 'Edit3, Download, Printer, Trophy');
}

// Add state for competition scores
const stateStr = `
  const [competitionScores, setCompetitionScores] = useState<Record<string, { plus: number; minus: number; note: string }>>({});
  
  // Load scores on mount
  useEffect(() => {
    const savedScores = localStorage.getItem("homeroom_competition_scores");
    if (savedScores) {
      try {
        setCompetitionScores(JSON.parse(savedScores));
      } catch (e) {}
    }
  }, []);

  const saveCompetitionScores = (newScores: Record<string, { plus: number; minus: number; note: string }>) => {
    setCompetitionScores(newScores);
    localStorage.setItem("homeroom_competition_scores", JSON.stringify(newScores));
  };

  const handleScoreChange = (studentId: string, field: 'plus' | 'minus' | 'note', value: string | number) => {
    const current = competitionScores[studentId] || { plus: 0, minus: 0, note: "" };
    const newScores = {
      ...competitionScores,
      [studentId]: {
        ...current,
        [field]: field === 'note' ? value : (Number(value) || 0)
      }
    };
    setCompetitionScores(newScores);
  };
  
  const getRankedStudents = () => {
    return students.map(st => {
      const score = competitionScores[st.id] || { plus: 0, minus: 0, note: "" };
      const total = score.plus - score.minus;
      return { ...st, score, total };
    }).sort((a, b) => b.total - a.total);
  };

  const exportToCSV = () => {
    const ranked = getRankedStudents();
    let csv = "STT,Họ và tên,Điểm cộng,Điểm trừ,Tổng điểm,Xếp hạng,Ghi chú\\n";
    ranked.forEach((st, idx) => {
      csv += \`\${idx + 1},"\${st.name}",\${st.score.plus},\${st.score.minus},\${st.total},\${idx + 1},"\${st.score.note}"\\n\`;
    });
    
    // add BOM for utf-8
    const blob = new Blob(["\\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Bao_Cao_Thi_Dua_Lop.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    const ranked = getRankedStudents();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let html = \`
      <html>
      <head>
        <title>Báo Cáo Thi Đua Lớp</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { text-align: center; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; }
          th { background-color: #f8fafc; }
          td.name { text-align: left; font-weight: bold; }
          td.note { text-align: left; }
        </style>
      </head>
      <body>
        <h1>BẢNG TỔNG HỢP THI ĐUA LỚP</h1>
        <table>
          <thead>
            <tr>
              <th>Hạng</th>
              <th>Họ và tên</th>
              <th>Điểm cộng</th>
              <th>Điểm trừ</th>
              <th>Tổng điểm</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
    \`;
    
    ranked.forEach((st, idx) => {
      html += \`
        <tr>
          <td>\${idx + 1}</td>
          <td class="name">\${st.name}</td>
          <td style="color: #16a34a;">+\${st.score.plus}</td>
          <td style="color: #dc2626;">-\${st.score.minus}</td>
          <td style="font-weight: bold;">\${st.total}</td>
          <td class="note">\${st.score.note}</td>
        </tr>
      \`;
    });
    
    html += \`
          </tbody>
        </table>
        <div style="margin-top: 40px; text-align: right; padding-right: 50px;">
          <p>Ngày ...... tháng ...... năm ......</p>
          <p><strong>Giáo viên Chủ nhiệm</strong></p>
        </div>
      </body>
      </html>
    \`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
`;
code = code.replace('const [searchTerm, setSearchTerm] = useState("");', 'const [searchTerm, setSearchTerm] = useState("");\n' + stateStr);

// Now update the competition tab layout
const newTab = `
      {activeTab === "competition" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:col-span-1 p-4">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Quy định thi đua
            </h3>
            <textarea 
              className="flex-1 w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Dán nội dung quy định thi đua của Đoàn trường vào đây (VD: Đi muộn -5đ, Không đeo thẻ -2đ...)"
              value={competitionRules}
              onChange={e => setCompetitionRules(e.target.value)}
            />
            <div className="mt-3">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" /> Tải lên File quy định (PDF/Word)
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:col-span-2 p-0">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Chấm điểm & Xếp hạng Tuần
              </h3>
              <div className="flex gap-2">
                <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> Xuất Excel
                </button>
                <button onClick={printReport} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm">
                  <Printer className="w-4 h-4" /> Xuất PDF (In)
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <th className="p-3 text-slate-600 font-semibold w-12 text-center">Hạng</th>
                    <th className="p-3 text-slate-600 font-semibold">Học sinh</th>
                    <th className="p-3 text-slate-600 font-semibold w-24 text-center">Điểm cộng</th>
                    <th className="p-3 text-slate-600 font-semibold w-24 text-center">Điểm trừ</th>
                    <th className="p-3 text-slate-600 font-semibold w-24 text-center">Tổng</th>
                    <th className="p-3 text-slate-600 font-semibold">Lý do / Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getRankedStudents().map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center">
                         {idx === 0 && st.total > 0 ? <Trophy className="w-5 h-5 text-yellow-500 mx-auto" /> : 
                          idx === 1 && st.total > 0 ? <Trophy className="w-5 h-5 text-slate-400 mx-auto" /> :
                          idx === 2 && st.total > 0 ? <Trophy className="w-5 h-5 text-amber-600 mx-auto" /> :
                          <span className="font-bold text-slate-400">{idx + 1}</span>}
                      </td>
                      <td className="p-3 font-medium text-slate-800">{st.name}</td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 border border-transparent hover:border-emerald-200 focus:border-emerald-500 bg-transparent focus:bg-white rounded text-center text-emerald-600 font-medium transition-colors" 
                          value={st.score.plus || ''} 
                          onChange={e => handleScoreChange(st.id, 'plus', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 border border-transparent hover:border-red-200 focus:border-red-500 bg-transparent focus:bg-white rounded text-center text-red-600 font-medium transition-colors" 
                          value={st.score.minus || ''} 
                          onChange={e => handleScoreChange(st.id, 'minus', e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className={\`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs \${st.total > 0 ? 'bg-emerald-100 text-emerald-700' : st.total < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}\`}>
                          {st.total > 0 ? '+' : ''}{st.total}
                        </span>
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-emerald-500 bg-transparent focus:bg-white rounded text-slate-600 transition-colors" 
                          placeholder="Nhập ghi chú..." 
                          value={st.score.note || ''}
                          onChange={e => handleScoreChange(st.id, 'note', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">Chưa có học sinh trong danh sách. Vui lòng thêm học sinh ở tab Danh sách.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
               <div className="text-sm text-slate-500">Mọi thay đổi điểm số sẽ được tự động lưu.</div>
               <button onClick={() => saveCompetitionScores(competitionScores)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                 <Save className="w-4 h-4" /> Lưu thủ công
               </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/\{activeTab === "competition" && \([\s\S]*?\)\}/, newTab.trim());

fs.writeFileSync('src/pages/HomeroomManagement.tsx', code);
console.log('Added export and points logic to HomeroomManagement');
