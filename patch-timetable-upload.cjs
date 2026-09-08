const fs = require('fs');
let code = fs.readFileSync('src/pages/WeeklyTimetable.tsx', 'utf8');

// Update lucide imports
if (!code.includes('Loader2')) {
  code = code.replace('Calendar, Plus, Upload, CheckSquare, Trash2', 'Calendar, Plus, Upload, CheckSquare, Trash2, Loader2, FileImage, Moon');
}

// Add state variables
const stateVars = `
  const [isExtracting, setIsExtracting] = useState(false);
  const periods = [
    { id: "1", label: "Tiết 1" },
    { id: "2", label: "Tiết 2" },
    { id: "3", label: "Tiết 3" },
    { id: "4", label: "Tiết 4" },
    { id: "5", label: "Tiết 5" },
    { id: "6", label: "Tiết 6" },
    { id: "7", label: "Tiết 7" },
    { id: "8", label: "Tiết 8" },
    { id: "9", label: "Tiết 9" },
    { id: "10", label: "Tiết 10" },
    { id: "Tối", label: "Tối" }
  ];
`;

code = code.replace('const periods = [1, 2, 3, 4, 5];', stateVars);

// Add upload handler
const uploadHandler = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          body: JSON.stringify({ file: base64, type: "timetable" })
        });
        const data = await res.json();
        
        if (data.entries) {
          const newTimetable = { ...timetable };
          data.entries.forEach((entry: any) => {
             const periodId = entry.period.toString();
             newTimetable[\`\${entry.day}-\${periodId}\`] = entry.content;
          });
          setTimetable(newTimetable);
          alert("Trích xuất TKB thành công!");
        } else {
          alert("Lỗi: Không tìm thấy dữ liệu TKB");
        }
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi trích xuất tài liệu. Vui lòng kiểm tra API Key.");
      } finally {
        setIsExtracting(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };
`;

code = code.replace('const updateTimetable', uploadHandler + '\n  const updateTimetable');

// Update UI Upload Button
const uploadBtnOld = `<button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Upload className="w-4 h-4" />
          <span className="font-medium text-sm">Nhập TKB từ file Excel</span>
        </button>`;

const uploadBtnNew = `<label className={\`flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg shadow-sm cursor-pointer transition-colors \${isExtracting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-50'}\`}>
          {isExtracting ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <FileImage className="w-4 h-4 text-emerald-600" />}
          <span className="font-medium text-sm">{isExtracting ? "Đang trích xuất AI..." : "Tải TKB (Ảnh/PDF/Doc)"}</span>
          <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} disabled={isExtracting} />
        </label>`;

code = code.replace(uploadBtnOld, uploadBtnNew);

// Update table rows rendering
const tableRowOld = `<tbody>
                {periods.map(p => (
                  <tr key={p}>
                    <td className="p-2 border bg-slate-50 text-slate-500 font-medium">{p}</td>
                    {days.map(d => {
                      const key = \`\${d}-\${p}\`;`;
                      
const tableRowNew = `<tbody>
                {periods.map((p, i) => (
                  <tr key={p.id} className={p.id === '6' ? 'border-t-4 border-slate-300' : p.id === 'Tối' ? 'border-t-4 border-slate-800' : ''}>
                    <td className={\`p-1 border text-xs font-medium text-center \${p.id === 'Tối' ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-500'}\`}>
                      {p.id === 'Tối' && <Moon className="w-3 h-3 mx-auto mb-1 text-yellow-300" />}
                      {p.label}
                    </td>
                    {days.map(d => {
                      const key = \`\${d}-\${p.id}\`;`;

code = code.replace(tableRowOld, tableRowNew);
code = code.replace(/updateTimetable\(d, p, e.target.value\)/g, "updateTimetable(d, p.id, e.target.value)");

fs.writeFileSync('src/pages/WeeklyTimetable.tsx', code);
console.log('WeeklyTimetable updated');
