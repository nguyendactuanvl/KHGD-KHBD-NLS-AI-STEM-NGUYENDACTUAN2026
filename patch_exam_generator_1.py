import re

with open("src/pages/ExamGenerator.tsx", "r") as f:
    code = f.read()

# Add Ngân hàng câu hỏi tab button
tab_buttons_old = """            <button 
              onClick={() => setActiveTab("shuffle")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'shuffle' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              3. Trộn Đề & Xuất Bản
            </button>"""
            
tab_buttons_new = """            <button 
              onClick={() => setActiveTab("shuffle")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'shuffle' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              3. Trộn Đề & Xuất Bản
            </button>
            <button 
              onClick={() => setActiveTab("banks")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'banks' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ngân hàng câu hỏi
            </button>"""
            
code = code.replace(tab_buttons_old, tab_buttons_new)

# We need to add state for question banks and generateMode
state_hooks_old = """  const [schoolLevel, setSchoolLevel] = useState("THCS");"""
state_hooks_new = """  const [schoolLevel, setSchoolLevel] = useState("THCS");
  const [generateMode, setGenerateMode] = useState<"auto" | "from_matrix_file">("auto");
  const [bankQuestions, setBankQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('question_banks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const saveToBank = (q: Question) => {
    const updated = [...bankQuestions, {...q, id: Date.now()}];
    setBankQuestions(updated);
    localStorage.setItem('question_banks', JSON.stringify(updated));
    alert("Đã lưu vào ngân hàng câu hỏi!");
  };
  
  const deleteFromBank = (id: number) => {
    const updated = bankQuestions.filter(q => q.id !== id);
    setBankQuestions(updated);
    localStorage.setItem('question_banks', JSON.stringify(updated));
  };
  
  const [bankFilterTopic, setBankFilterTopic] = useState("");
  const [bankFilterLevel, setBankFilterLevel] = useState("");
"""
code = code.replace(state_hooks_old, state_hooks_new)

with open("src/pages/ExamGenerator.tsx", "w") as f:
    f.write(code)

print("patched 1")
