const fs = require('fs');
let code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');

// 1. Add lucide icons if needed (MessageSquare)
if (!code.includes('MessageSquare')) {
  code = code.replace('Trash2, Edit2, FolderOpen', 'Trash2, Edit2, FolderOpen, MessageSquare, X, Send');
}

// 2. Add clearAllStudents logic
const stateIndex = code.indexOf('const [manualName, setManualName] = useState("");');
const injectState = `
  const [manualName, setManualName] = useState("");
  
  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
`;
code = code.replace('const [manualName, setManualName] = useState("");', injectState);

const saveStudentsIndex = code.indexOf('const saveStudents =');
const injectClearAll = `
  const clearAllStudents = () => {
    if (confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách học sinh của lớp này không? Hành động này không thể hoàn tác.")) {
      saveStudents([]);
      saveScores(scores.filter(s => !students.some(st => st.id === s.studentId)));
    }
  };

  const saveStudents =`;
code = code.replace('const saveStudents =', injectClearAll);

// 3. Add AI Query Function
const queryFunc = `
  const askAi = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      // Prepare context: students and their scores
      const contextData = getRankedStudents().map((st, i) => ({
        rank: i + 1,
        name: st.name,
        score: st.totalScore
      })).slice(0, 15); // Top 15 to save context

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiQuery, context: contextData })
      });
      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.text);
      } else {
        setAiResponse("Lỗi: " + (data.error || "Không thể kết nối AI"));
      }
    } catch (e) {
      setAiResponse("Lỗi kết nối.");
    } finally {
      setIsAiLoading(false);
    }
  };
`;
code = code.replace('const handleStudentUpload', queryFunc + '\n  const handleStudentUpload');

// 4. Update the buttons UI to add AI and Clear buttons
const oldControls = `<div className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập tên học sinh..." 
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addManualStudent()}
            />
            <button onClick={addManualStudent} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium whitespace-nowrap">
              Thêm HS
            </button>
          </div>`;

const newControls = `<div className="mt-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập tên học sinh..." 
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addManualStudent()}
            />
            <button onClick={addManualStudent} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium whitespace-nowrap shadow-sm">
              Thêm HS
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2 justify-between">
            <button onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded hover:from-purple-600 hover:to-indigo-700 text-sm font-medium shadow-sm transition-all">
              <MessageSquare className="w-4 h-4" /> Trợ lý AI (Gợi ý thi đua)
            </button>
            <button onClick={clearAllStudents} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 hover:text-red-700 text-sm font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> Xóa DS Lớp
            </button>
          </div>`;
code = code.replace(oldControls, newControls);

// 5. Add AI Modal JSX at the very end before last </div>
const modalJsx = `
      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" /> Trợ lý AI Thi đua
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-slate-50 flex flex-col gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-slate-700 text-sm">
                👋 Chào thầy/cô! Tôi có thể giúp phân tích tình hình thi đua hiện tại, đưa ra các hình thức khen thưởng/kỷ luật sáng tạo, hoặc các trò chơi tương tác phù hợp với lớp.
              </div>
              
              {aiResponse && (
                <div className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100 text-slate-800 text-sm prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>') }} />
                </div>
              )}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium p-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> AI đang suy nghĩ...
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white">
               <div className="flex gap-2">
                 <input
                   type="text"
                   className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="VD: Gợi ý cách thưởng cho 3 bạn đứng đầu tuần này..."
                   value={aiQuery}
                   onChange={e => setAiQuery(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && askAi()}
                 />
                 <button onClick={askAi} disabled={isAiLoading || !aiQuery.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium">
                   <Send className="w-4 h-4" /> Gửi
                 </button>
               </div>
               <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                 <button onClick={() => setAiQuery("Gợi ý 3 hình thức khen thưởng độc đáo cho Top 1")} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">Khen thưởng Top 1</button>
                 <button onClick={() => setAiQuery("Cách xử lý khéo léo học sinh hay bị điểm trừ nhiều nhất")} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">Xử lý học sinh vi phạm</button>
                 <button onClick={() => setAiQuery("Đề xuất 1 trò chơi 5 phút đầu giờ để khuấy động không khí lớp")} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">Trò chơi đầu giờ</button>
               </div>
            </div>
          </div>
        </div>
      )}
`;
code = code.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/, modalJsx + '\n    </div>\n  </div>\n  );\n}');

fs.writeFileSync('src/pages/Gamification.tsx', code);
console.log('Added AI query and Clear functions to Gamification.tsx');
