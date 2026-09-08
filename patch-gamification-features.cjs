const fs = require('fs');
let code = fs.readFileSync('src/pages/Gamification.tsx', 'utf8');

// Update lucide imports
if (!code.includes('Loader2')) {
  code = code.replace('Filter, History', 'Filter, History, Loader2, Upload, Plus, Trash2, Edit2, FolderOpen');
}

// State changes for Multi-class
const stateMultiClass = `
  const [classes, setClasses] = useState<{id: string, name: string}[]>([{ id: "homeroom", name: "Lớp Chủ nhiệm" }]);
  const [selectedClassId, setSelectedClassId] = useState<string>("homeroom");
  const [isExtractingSt, setIsExtractingSt] = useState(false);
  const [manualName, setManualName] = useState("");
`;
code = code.replace('const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("week");', 'const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("week");\n' + stateMultiClass);

const loadDataUpdate = `
  useEffect(() => {
    // Load classes list
    const savedClasses = localStorage.getItem("gvbm_classes");
    if (savedClasses) {
      try {
        setClasses(JSON.parse(savedClasses));
      } catch(e) {}
    }
  }, []);

  // Load students and scores when class changes
  useEffect(() => {
    const stKey = selectedClassId === "homeroom" ? "homeroom_students" : \`gvbm_students_\${selectedClassId}\`;
    const scKey = \`gvbm_scores_\${selectedClassId}\`;
    
    const savedSt = localStorage.getItem(stKey);
    if (savedSt) {
      try { setStudents(JSON.parse(savedSt)); } catch(e) { setStudents([]); }
    } else { setStudents([]); }

    const savedScores = localStorage.getItem(scKey);
    if (savedScores) {
      try { setScores(JSON.parse(savedScores)); } catch(e) { setScores([]); }
    } else { setScores([]); }
  }, [selectedClassId]);

  const saveStudents = (newSt: Student[]) => {
    setStudents(newSt);
    const stKey = selectedClassId === "homeroom" ? "homeroom_students" : \`gvbm_students_\${selectedClassId}\`;
    localStorage.setItem(stKey, JSON.stringify(newSt));
  };

  const saveScores = (newScores: ScoreRecord[]) => {
    setScores(newScores);
    localStorage.setItem(\`gvbm_scores_\${selectedClassId}\`, JSON.stringify(newScores));
  };
  
  const addClass = () => {
    const name = prompt("Nhập tên lớp (VD: 10A1, 10A2...):");
    if (!name) return;
    const newClass = { id: \`cls_\${Date.now()}\`, name };
    const newClasses = [...classes, newClass];
    setClasses(newClasses);
    localStorage.setItem("gvbm_classes", JSON.stringify(newClasses));
    setSelectedClassId(newClass.id);
  };
  
  const removeClass = (id: string) => {
    if (id === "homeroom") {
      alert("Không thể xóa Lớp Chủ nhiệm mặc định");
      return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa lớp này và toàn bộ điểm số của học sinh lớp này?")) {
      const newClasses = classes.filter(c => c.id !== id);
      setClasses(newClasses);
      localStorage.setItem("gvbm_classes", JSON.stringify(newClasses));
      localStorage.removeItem(\`gvbm_students_\${id}\`);
      localStorage.removeItem(\`gvbm_scores_\${id}\`);
      if (selectedClassId === id) setSelectedClassId("homeroom");
    }
  };

  const addManualStudent = () => {
    if (!manualName.trim()) return;
    const newSt = { id: \`hs_\${Date.now()}\`, name: manualName.trim(), role: "", isFixed: false };
    saveStudents([...students, newSt]);
    setManualName("");
  };

  const removeStudent = (id: string) => {
    if (confirm("Xác nhận xóa học sinh này?")) {
      saveStudents(students.filter(s => s.id !== id));
    }
  };

  const handleStUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsExtractingSt(true);
      try {
        const key = localStorage.getItem("user_gemini_api_key") || "";
        const res = await fetch("/api/extract-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": key
          },
          body: JSON.stringify({ file: base64, type: "students" })
        });
        const data = await res.json();
        
        if (data.students && Array.isArray(data.students)) {
          const newStudents = data.students.map((name: string, i: number) => ({
            id: \`hs_\${Date.now()}_\${i}\`,
            name, role: "", isFixed: false
          }));
          
          if (students.length > 0) {
            if (confirm("Lớp này đã có danh sách học sinh. Bạn có muốn ghi đè danh sách mới (Xóa cũ) không? Chọn OK để XÓA cũ và THAY MỚI, Cancel để THÊM NỐI TIẾP.")) {
               saveStudents(newStudents);
            } else {
               saveStudents([...students, ...newStudents]);
            }
          } else {
             saveStudents(newStudents);
          }
          alert(\`Trích xuất thành công \${data.students.length} học sinh!\`);
        } else {
          alert("Lỗi: Không tìm thấy tên học sinh");
        }
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi trích xuất. Vui lòng kiểm tra API Key.");
      } finally {
        setIsExtractingSt(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };
`;

const oldEffect = `
  useEffect(() => {
    const savedSt = localStorage.getItem("homeroom_students");
    if (savedSt) {
      try {
        setStudents(JSON.parse(savedSt));
      } catch (e) {}
    }
    const savedScores = localStorage.getItem("gvbm_scores");
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {}
    }
  }, []);

  const saveScores = (newScores: ScoreRecord[]) => {
    setScores(newScores);
    localStorage.setItem("gvbm_scores", JSON.stringify(newScores));
  };
`;

code = code.replace(oldEffect.trim(), loadDataUpdate.trim());


const newHeader = `
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Thi đua & Gọi tên (GVBM)</h2>
          <p className="text-slate-500">Tổ chức trò chơi gọi tên và quản lý điểm số tích lũy của học sinh</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <FolderOpen className="w-5 h-5 text-slate-400 ml-1" />
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-2 py-1.5 border-none bg-transparent font-semibold text-emerald-700 focus:ring-0 outline-none w-48"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button onClick={addClass} title="Thêm Lớp mới" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={() => removeClass(selectedClassId)} title="Xóa Lớp này" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
`;
code = code.replace(/<div className="mb-6">\s*<h2[\s\S]*?<\/div>/, newHeader.trim());


const newTab2Content = `
            {/* Student List */}
            <div className="md:col-span-2 flex flex-col h-[500px] md:h-auto">
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-800 shrink-0 mr-auto">Danh sách lớp ({students.length})</h3>
                
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Nhập thủ công..." 
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addManualStudent()}
                    className="flex-1 sm:w-32 px-2 py-1.5 border border-slate-300 rounded-l-md text-sm focus:ring-emerald-500" 
                  />
                  <button onClick={addManualStudent} className="px-2 py-1.5 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <label className={\`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md shadow-sm border cursor-pointer transition-colors \${isExtractingSt ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}\`}>
                  {isExtractingSt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isExtractingSt ? "Đang quét AI..." : "Tải Danh sách (Ảnh/PDF)"}</span>
                  <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleStUpload} disabled={isExtractingSt} />
                </label>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students.map(st => {
                    const stTotal = getFilteredScores().filter(s => s.studentId === st.id).reduce((sum, s) => sum + s.points, 0);
                    
                    return (
                      <div key={st.id} className="flex flex-col gap-2 p-3 border border-slate-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all bg-white group relative">
                        <button onClick={() => removeStudent(st.id)} className="absolute top-1 right-1 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50">
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex justify-between items-start pr-6">
                          <span className="font-medium text-slate-800 truncate" title={st.name}>{st.name}</span>
                          <span className={\`font-bold shrink-0 ml-2 \${stTotal > 0 ? 'text-emerald-600' : stTotal < 0 ? 'text-red-500' : 'text-slate-400'}\`}>
                            {stTotal > 0 ? '+' : ''}{stTotal}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => addScore(st.id, 1, "Cộng điểm")} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-500 hover:text-white font-medium text-sm flex items-center justify-center gap-1 transition-colors">
                            <Star className="w-3.5 h-3.5" /> +1
                          </button>
                          <button onClick={() => addScore(st.id, -1, "Trừ điểm")} className="flex-1 py-1.5 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-500 hover:text-white font-medium text-sm flex items-center justify-center gap-1 transition-colors">
                            <MinusCircle className="w-3.5 h-3.5" /> -1
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
`;
const oldTab2 = `
            {/* Student List */}
            <div className="md:col-span-2 flex flex-col h-[400px] md:h-auto">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Danh sách lớp ({students.length})</h3>
                <input type="text" placeholder="Tìm học sinh..." className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-emerald-500 w-48" />
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {students.map(st => {
                    const stTotal = getFilteredScores().filter(s => s.studentId === st.id).reduce((sum, s) => sum + s.points, 0);
                    
                    return (
                      <div key={st.id} className="flex flex-col gap-2 p-3 border border-slate-200 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all bg-white group">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-slate-800">{st.name}</span>
                          <span className={\`font-bold \${stTotal > 0 ? 'text-emerald-600' : stTotal < 0 ? 'text-red-500' : 'text-slate-400'}\`}>
                            {stTotal > 0 ? '+' : ''}{stTotal}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => addScore(st.id, 1, "Cộng điểm")} className="flex-1 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 font-medium text-sm flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5" /> +1
                          </button>
                          <button onClick={() => addScore(st.id, -1, "Trừ điểm")} className="flex-1 py-1 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 font-medium text-sm flex items-center justify-center gap-1">
                            <MinusCircle className="w-3.5 h-3.5" /> -1
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
`;

code = code.replace(oldTab2.trim(), newTab2Content.trim());


fs.writeFileSync('src/pages/Gamification.tsx', code);
console.log('Gamification patched');
