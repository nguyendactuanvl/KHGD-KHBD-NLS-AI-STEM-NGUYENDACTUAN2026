import { useState, useEffect } from "react";
import { Upload, Plus, Save, Trash2, Award, FileText, Loader2, FileImage, Search, Edit3 } from "lucide-react";
import { Student } from "../types";

export function HomeroomManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [competitionRules, setCompetitionRules] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"list" | "competition">("list");

  const [isExtracting, setIsExtracting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  
  useEffect(() => {
    const saved = localStorage.getItem("homeroom_students");
    if (saved) {
      try {
        setStudents(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveStudents = (newSt: Student[]) => {
    setStudents(newSt);
    localStorage.setItem("homeroom_students", JSON.stringify(newSt));
  };

  const addStudent = () => {
    const newId = `hs${Date.now()}`;
    saveStudents([...students, { id: newId, name: "Học sinh mới", role: "" }]);
  };

  const updateStudent = (id: string, field: string, value: string) => {
    saveStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeStudent = (id: string) => {
    saveStudents(students.filter(s => s.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use AI for images/pdfs
    if (file.type.startsWith('image/') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
       const reader = new FileReader();
       reader.onload = async (event) => {
         const base64 = event.target?.result as string;
         setIsExtracting(true);
         try {
           const key = localStorage.getItem("user_gemini_api_key") || "";
           const res = await fetch("/api/extract-data", {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
               "x-gemini-api-key": key
             },
             body: JSON.stringify({ file: base64, type: "student_profiles" })
           });
           const data = await res.json();
           
           if (data.students && Array.isArray(data.students)) {
             const newStudents = data.students.map((st: any, i: number) => ({
               id: `hs_${Date.now()}_${i}`,
               name: st.name || "",
               dob: st.dob || "",
               phone: st.phone || "",
               parentName: st.parentName || "",
               parentPhone: st.parentPhone || "",
               address: st.address || "",
               notes: st.notes || "",
               role: "",
               isFixed: false
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
             alert(`Trích xuất thành công ${data.students.length} hồ sơ học sinh!`);
           } else {
             alert("Lỗi: Không tìm thấy thông tin học sinh");
           }
         } catch (err) {
           console.error(err);
           alert("Có lỗi xảy ra khi trích xuất. Vui lòng kiểm tra API Key.");
         } finally {
           setIsExtracting(false);
           e.target.value = '';
         }
       };
       reader.readAsDataURL(file);
    } else {
      // Local CSV parsing
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
        
        const newStudents: Student[] = [];
        
        let startIndex = 0;
        if (lines.length > 0 && (lines[0].toLowerCase().includes('tên') || lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('stt'))) {
            startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
           const l = lines[i];
           if (l.includes(',')) {
              // Parse basic CSV: STT, Name, DOB, Phone, Parent, ParentPhone
              const parts = l.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
              let nameIdx = 0;
              if (!isNaN(Number(parts[0])) && parts.length > 1) nameIdx = 1; // skip STT
              
              if (parts[nameIdx]) {
                newStudents.push({
                  id: `hs_${Date.now()}_${i}`,
                  name: parts[nameIdx],
                  dob: parts[nameIdx + 1] || "",
                  phone: parts[nameIdx + 2] || "",
                  parentName: parts[nameIdx + 3] || "",
                  parentPhone: parts[nameIdx + 4] || "",
                  role: "",
                  isFixed: false
                });
              }
           } else {
              // Just a name list
              if (isNaN(Number(l))) {
                 newStudents.push({
                    id: `hs_${Date.now()}_${i}`,
                    name: l.trim(),
                    role: "",
                    isFixed: false
                 });
              }
           }
        }

        if (newStudents.length === 0) return;
        
        if (students.length > 0) {
           if (confirm("Ghi đè danh sách mới (OK) hay Thêm nối tiếp (Cancel)?")) {
              saveStudents(newStudents);
           } else {
              saveStudents([...students, ...newStudents]);
           }
        } else {
           saveStudents(newStudents);
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  
  const filteredStudents = students.filter(st => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      st.name.toLowerCase().includes(term) ||
      (st.phone && st.phone.includes(term)) ||
      (st.parentName && st.parentName.toLowerCase().includes(term)) ||
      (st.parentPhone && st.parentPhone.includes(term))
    );
  });

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Lớp Chủ nhiệm</h2>
        <p className="text-slate-500">Danh sách học sinh, Ban cán sự và Thi đua</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("list")}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "list" ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Danh sách & Chức vụ
        </button>
        <button 
          onClick={() => setActiveTab("competition")}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "competition" ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Quy định & Thi đua
        </button>
      </div>

      {activeTab === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-slate-50">
            <div className="flex flex-wrap gap-3">
              <button onClick={addStudent} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium">
                <Plus className="w-4 h-4" /> Thêm HS
              </button>
              <label className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-medium cursor-pointer transition-colors ${isExtracting ? 'opacity-70 pointer-events-none' : ''}`}>
                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4" />}
                {isExtracting ? 'Đang trích xuất AI...' : 'Nhập Hồ sơ (Excel/Ảnh/PDF)'}
                <input type="file" className="hidden" accept=".csv,.txt,image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                <input 
                  type="text"
                  placeholder="Tìm tên, SĐT, Phụ huynh..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-emerald-500 w-64"
                />
              </div>
              <div className="text-sm text-slate-500 hidden sm:block">
                Sĩ số: <strong className="text-slate-800">{filteredStudents.length}/{students.length}</strong>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-12 text-center border-r border-slate-200">STT</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-48 border-r border-slate-200">Họ và tên</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-32 border-r border-slate-200">Ngày sinh</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-32 border-r border-slate-200">SĐT HS</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-48 border-r border-slate-200">Họ tên Phụ huynh</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-32 border-r border-slate-200">SĐT Phụ huynh</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-48 border-r border-slate-200">Chức vụ</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 w-16 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, i) => (
                  <tr key={st.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm text-slate-500 text-center border-r border-slate-100">{i + 1}</td>
                    <td className="px-4 py-2 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={st.name || ""} 
                        onChange={e => updateStudent(st.id, "name", e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-emerald-500 rounded text-sm font-medium text-slate-800 transition-colors"
                        placeholder="Tên học sinh..."
                      />
                    </td>
                    <td className="px-4 py-2 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={st.dob || ""} 
                        onChange={e => updateStudent(st.id, "dob", e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-emerald-500 rounded text-sm text-slate-600 transition-colors"
                        placeholder="DD/MM/YYYY"
                      />
                    </td>
                    <td className="px-4 py-2 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={st.phone || ""} 
                        onChange={e => updateStudent(st.id, "phone", e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-emerald-500 rounded text-sm text-slate-600 transition-colors"
                        placeholder="Số điện thoại..."
                      />
                    </td>
                    <td className="px-4 py-2 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={st.parentName || ""} 
                        onChange={e => updateStudent(st.id, "parentName", e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-emerald-500 rounded text-sm text-slate-600 transition-colors"
                        placeholder="Tên Phụ huynh..."
                      />
                    </td>
                    <td className="px-4 py-2 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={st.parentPhone || ""} 
                        onChange={e => updateStudent(st.id, "parentPhone", e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-emerald-500 rounded text-sm text-slate-600 transition-colors font-medium"
                        placeholder="SĐT Phụ huynh..."
                      />
                    </td>
                    <td className="px-4 py-2 border-r border-slate-100">
                      <select 
                        value={st.role || ""} 
                        onChange={e => updateStudent(st.id, "role", e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-300 focus:bg-white focus:border-emerald-500 rounded text-sm text-slate-600 transition-colors"
                      >
                        <option value="">-- Không --</option>
                        <option value="Lớp trưởng">Lớp trưởng</option>
                        <option value="Lớp phó Học tập">Lớp phó Học tập</option>
                        <option value="Lớp phó Lao động">Lớp phó Lao động</option>
                        <option value="Lớp phó Kỷ luật">Lớp phó Kỷ luật</option>
                        <option value="Lớp phó Văn thể mỹ">Lớp phó Văn thể mỹ</option>
                        <option value="Tổ trưởng Tổ 1">Tổ trưởng Tổ 1</option>
                        <option value="Tổ trưởng Tổ 2">Tổ trưởng Tổ 2</option>
                        <option value="Tổ trưởng Tổ 3">Tổ trưởng Tổ 3</option>
                        <option value="Tổ trưởng Tổ 4">Tổ trưởng Tổ 4</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => removeStudent(st.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa học sinh">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 bg-slate-50/50">
                      {students.length === 0 ? "Chưa có học sinh nào. Hãy thêm học sinh hoặc tải lên file danh sách (Excel, Ảnh, PDF)." : "Không tìm thấy học sinh nào phù hợp."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:col-span-2 p-4">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" /> Chấm điểm & Xếp loại Tuần
            </h3>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-2 border-b text-slate-500">Học sinh</th>
                    <th className="p-2 border-b text-slate-500 w-24 text-center">Điểm cộng</th>
                    <th className="p-2 border-b text-slate-500 w-24 text-center">Điểm trừ</th>
                    <th className="p-2 border-b text-slate-500">Lý do / Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.slice(0, 10).map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-700">{st.name}</td>
                      <td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-center" defaultValue={0} /></td>
                      <td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-center text-red-600" defaultValue={0} /></td>
                      <td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" placeholder="Ghi chú..." /></td>
                    </tr>
                  ))}
                  {students.length > 10 && (
                    <tr><td colSpan={4} className="p-2 text-center text-slate-400 italic">... và {students.length - 10} học sinh khác</td></tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Lưu đánh giá tuần</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
