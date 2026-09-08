const fs = require('fs');
let code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');

const modalJsx = `
      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" /> Trợ lý AI Thi đua
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
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
                   onKeyDown={e => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       askAi();
                     }
                   }}
                 />
                 <button onClick={askAi} disabled={isAiLoading || !aiQuery.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium">
                   <Send className="w-4 h-4" /> Gửi
                 </button>
               </div>
               <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                 <button onClick={() => { setAiQuery("Gợi ý 3 hình thức khen thưởng độc đáo cho Top 1"); setTimeout(() => askAi(), 100); }} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">Khen thưởng Top 1</button>
                 <button onClick={() => { setAiQuery("Cách xử lý khéo léo học sinh hay bị điểm trừ nhiều nhất"); setTimeout(() => askAi(), 100); }} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">Xử lý học sinh vi phạm</button>
                 <button onClick={() => { setAiQuery("Đề xuất 1 trò chơi 5 phút đầu giờ để khuấy động không khí lớp"); setTimeout(() => askAi(), 100); }} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">Trò chơi đầu giờ</button>
               </div>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('AI Assistant Modal')) {
  // Replace the final "    </div>\n  );\n}" with the modal plus the original ending
  const lastIndex = code.lastIndexOf('    </div>\n  );\n}');
  if (lastIndex !== -1) {
     code = code.substring(0, lastIndex) + modalJsx + '\n' + code.substring(lastIndex);
     fs.writeFileSync('src/pages/Gamification.tsx', code);
     console.log('Modal injected!');
  } else {
     console.log('Could not find injection point');
  }
} else {
  console.log('Modal already present');
}

// Ensure clearAllStudents isn't failing silently due to some React event object issues
code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');
code = code.replace(/onClick=\{clearAllStudents\}/g, 'onClick={(e) => { e.preventDefault(); clearAllStudents(); }}');
fs.writeFileSync('src/pages/Gamification.tsx', code);

