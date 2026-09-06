const fs = require('fs');
let code = fs.readFileSync('src/pages/EducationalPlan.tsx', 'utf8');

// Add states
code = code.replace(
  'const [isGenerating, setIsGenerating] = useState(false);',
  `const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("10");
  const [topic, setTopic] = useState("Đại số tổ hợp");
  const [uploadedFiles, setUploadedFiles] = useState<{data: string, type: string, name: string}[]>([]);`
);

// Fix handleFileUpload to accept multiple files
code = code.replace(
  'const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {\n    if (e.target.files && e.target.files.length > 0) {\n       alert(`Đã tải lên và phân tích thành công file: ${e.target.files[0].name}. Giả lập AI: Hệ thống đã nhận diện đầy đủ dữ liệu của Khối 10, Khối 11, Khối 12.`);\n       setPlans(fullPlan); \n    }\n  };',
  `const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result?.toString().split(',')[1];
          if (base64) {
            setUploadedFiles(prev => [...prev, {
              data: base64,
              type: file.type || 'text/plain',
              name: file.name
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };`
);

// Fix API payload
code = code.replace(
  'body: JSON.stringify({\n          subject: "Toán",\n          grade: "10",\n          topic: "Đại số tổ hợp"\n        }),',
  `body: JSON.stringify({
          subject,
          grade,
          topic,
          files: uploadedFiles
        }),`
);

// Modify UI
const oldHeader = `<h2 className="text-2xl font-bold text-slate-800">Kế hoạch giáo dục</h2>
            <p className="text-slate-500 mt-1">Cập nhật theo Công văn 5512 và QĐ 2422 (Năm học 2026-2027)</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".docx,.xlsx,.xls"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Tải lên KHGD
            </button>
            <button 
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Xuất Word
            </button>
            <button 
              onClick={generateAIPlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Bổ sung NLS/AI
            </button>
          </div>`;

const newHeader = `<div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">Kế hoạch giáo dục</h2>
            <p className="text-slate-500 mt-1">Cập nhật theo Công văn 5512 và QĐ 2422</p>
            
            <div className="flex flex-wrap gap-3 mt-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Môn học</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-32 px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Lớp</label>
                <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chủ đề</label>
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-48 px-3 py-1.5 border border-slate-300 rounded-md text-sm" />
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden" 
                accept=".pdf,.txt,.csv,.docx,.xlsx"
                multiple
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-sm"
              >
                <Upload className="h-4 w-4" />
                Tải liệu ({uploadedFiles.length})
              </button>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {uploadedFiles.map((f, i) => (
                  <span key={i} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
                    {f.name}
                    <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 font-bold ml-1 hover:text-red-700">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Xuất Word
            </button>
            <button 
              onClick={generateAIPlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI Bổ sung NLS/AI
            </button>
          </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/pages/EducationalPlan.tsx', code);
